import { CircularDependencyError } from './CircularDependencyError.js';
import { findMetadata, findOrCreateMetadata } from './findMetadata.js';
import { isSingleton } from './isSingleton.js';
import { modifyConstructor } from './modifyConstructor.js';
import { Trace } from './Trace.js';
import {
  AbstractConstructor,
  Constructor,
  Container,
  Dependency,
  IHaveDependencies,
  IHaveInstances,
  IHaveSingletons,
  ImplementationType,
  RegistrationType,
} from './types.js';
import { workWithDiSettings } from './workWithDiSettings.js';

class ContainerImpl implements Container, IHaveSingletons, IHaveInstances, IHaveDependencies, Disposable {
  singletons: Map<ImplementationType<any>, object>;
  instances: Map<RegistrationType<any>, object>;
  dependencies: Map<RegistrationType<any>, ImplementationType<any> | object>;

  constructor() {
    this.singletons = new Map();
    this.instances = new Map();
    this.dependencies = new Map();
  }

  /** register implementation class */
  registerImplementation<TInstance>(implementationType: Constructor<TInstance>) {
    const inject = (...injectionParams: any[]) => {
      modifyConstructor(implementationType, (settings) => {
        const metadata = findOrCreateMetadata(settings);
        metadata.injected = injectionParams;
      });
    };

    this.dependencies.set(implementationType, implementationType);

    return {
      /** as super class */
      as: <TBase extends Partial<TInstance>>(type: RegistrationType<TBase>) => {
        this.dependencies.delete(implementationType);
        this.dependencies.set(type, implementationType);
        return {
          /** add parameters that will be passed to the class constructor */
          inject,
        };
      },
      /** as singleton (optionally super class) */
      asSingleton: <TBase extends Partial<TInstance>>(type?: RegistrationType<TBase>) => {
        if (type) {
          this.dependencies.delete(implementationType);
          this.dependencies.set(type, implementationType);
        }

        if (!isSingleton(implementationType)) {
          workWithDiSettings(implementationType, (settings) => {
            const metadata = findOrCreateMetadata(settings);
            metadata.modifiedClass = implementationType as TInstance;
            metadata.singleton = true;
          });
        }

        return {
          /** add parameters that will be passed to the class constructor */
          inject,
        };
      },
      /** add parameters that will be passed to the class constructor */
      inject,
    };
  }

  /** register any object as its constructor */
  registerInstance<TInstance extends object>(instance: TInstance) {
    const constructor = instance.constructor as Constructor<TInstance>;
    if (constructor) {
      this.instances.set(constructor, instance);
    }

    return {
      /** or register the object as any class */
      as: <TBase extends Partial<TInstance>>(type: RegistrationType<TBase>) => {
        if (constructor) {
          this.instances.delete(constructor);
        }
        this.instances.set(type, instance);
      },
    };
  }

  /** instantiate (or get instance for singleton) by class */
  resolve<TInstance>(
    type: Constructor<TInstance> | AbstractConstructor<TInstance>,
    ...args: any[]
  ): TInstance | undefined {
    const trace = new Trace(type.name);
    try {
      return this.internalResolve(type, trace, ...args);
    } catch (error) {
      if (error instanceof RangeError) {
        const tree = trace.build();
        console.warn('cheap-di, circular dependencies tree', tree);
        throw new CircularDependencyError(`Circular dependencies during resolve ${type.name}. ${error.message}`);
      }
      throw error;
    }
  }

  /** clear all registered classes and instances */
  clear() {
    this.instances.clear();
    this.singletons.clear();
    this.dependencies.clear();
  }

  [Symbol.dispose]() {
    this.clear();
  }

  private internalResolve<TInstance>(
    type: Constructor<TInstance> | AbstractConstructor<TInstance>,
    trace: Trace,
    ...args: any[]
  ): TInstance | undefined {
    if (typeof type !== 'function') {
      return undefined;
    }

    const instance = this.getInstance(type);
    if (instance) {
      return instance as TInstance;
    }

    const implementation = this.getImplementation(type) || type;
    if (!isImplementationType(implementation)) {
      return implementation as object as TInstance;
    }

    if (isSingleton(implementation)) {
      const singletons = this.getSingletons();
      if (singletons.has(implementation)) {
        return singletons.get(implementation) as TInstance;
      }
    }

    trace.implemented = implementation.name;

    const metadata = findMetadata<TInstance | object>(implementation);

    let injectableArguments: any[] = [];
    const injectionParams: any[] = [];
    if (metadata?.injected) {
      injectionParams.push(...metadata.injected);
    }
    injectionParams.push(...args);

    let index = 0;
    let injectionParamsIndex = 0;

    const { dependencies } = metadata ?? {};
    if (dependencies?.length) {
      const resolvedDependencies: any[] = [];
      const definedDependencies = dependencies.filter((dependency) => dependency !== 'unknown') as Dependency[];

      while (true) {
        const dependencyType = definedDependencies[index];
        if (dependencyType) {
          trace.addTrace(dependencyType.name);

          const instance = this.internalResolve(dependencyType, trace.trace!);
          const isNewInstance =
            !this.isRegisteredInstance(dependencyType, instance) && !this.isRegisteredType(dependencyType, instance);
          if (
            // todo: can't remember why is it, have to add comment ...
            isNewInstance &&
            injectionParams[injectionParamsIndex] instanceof Object &&
            injectionParams[injectionParamsIndex].constructor === dependencyType
          ) {
            resolvedDependencies[index] = injectionParams[injectionParamsIndex];
            injectionParamsIndex++;
          } else {
            resolvedDependencies[index] = instance;
          }
        } else if (injectionParams[injectionParamsIndex]) {
          resolvedDependencies[index] = injectionParams[injectionParamsIndex];
          injectionParamsIndex++;
        }

        index++;

        if (index >= definedDependencies.length) {
          break;
        }
      }

      // put resolved dependencies and injection params in the defined order
      let dependencyIndex = 0;
      let paramsIndex = 0;
      for (let index = 0; index < dependencies.length; index++) {
        const dependency = dependencies[index];
        if (dependency === 'unknown') {
          const injectionParam = injectionParams[paramsIndex];
          paramsIndex++;
          injectableArguments[index] = injectionParam;
        } else {
          const resolvedDependency = resolvedDependencies[dependencyIndex];
          dependencyIndex++;
          injectableArguments[index] = resolvedDependency;
        }
      }

      // pass rest arguments to the end
      if (paramsIndex < injectionParams.length) {
        const restParams = injectionParams.slice(paramsIndex);
        const notReplacedParams: any[] = [];

        /**
         * @example
         * class MyService {
         *   constructor(public some: string) {}
         * }
         *
         * @inject(MyService)
         * class Some {
         *   constructor(public service: MyService) {}
         * }
         *
         * container.registerImplementation(Some).inject(new MyService('123'));
         *
         * container.resolve(Some); // here you would like to get Some with MyService with '123', and not auto-resolved MyService
         * */
        restParams.forEach((restParameter) => {
          if (!restParameter) {
            notReplacedParams.push(restParameter);
            return;
          }
          if (typeof restParameter !== 'object') {
            notReplacedParams.push(restParameter);
            return;
          }

          const replaceableIndex = injectableArguments.findIndex(
            (argument) =>
              argument != null && typeof argument === 'object' && argument instanceof restParameter.constructor
          );
          if (replaceableIndex === -1) {
            notReplacedParams.push(restParameter);
            return;
          }

          injectableArguments.splice(replaceableIndex, 1, restParameter);
        });

        injectableArguments.push(...restParams);
      }
    } else {
      injectableArguments = injectionParams;
    }

    const target = new implementation(...injectableArguments);

    if (isSingleton(implementation)) {
      const singletons = this.getSingletons();
      singletons.set(implementation, target);
    }

    return target;
  }

  getInstance<TInstance>(
    type: Constructor<TInstance> | AbstractConstructor<TInstance>
  ): ImplementationType<TInstance> | object | undefined {
    if (this.instances.has(type)) {
      return this.instances.get(type)!;
    }

    return undefined;
  }

  getImplementation<TInstance>(
    type: Constructor<TInstance> | AbstractConstructor<TInstance>
  ): ImplementationType<TInstance> | object | undefined {
    if (this.dependencies.has(type)) {
      return this.dependencies.get(type)!;
    }

    return undefined;
  }

  getSingletons() {
    return this.singletons;
  }

  private isRegisteredInstance(dependencyType: Dependency, instance: any) {
    return instance === this.getInstance(dependencyType);
  }

  private isRegisteredType(dependencyType: Dependency, instance: any) {
    return instance.constructor === this.getImplementation(dependencyType);
  }
}

function isImplementationType(value: any): value is ImplementationType<any> {
  return typeof value === 'function';
}

const container = new ContainerImpl();
export { ContainerImpl, container };
