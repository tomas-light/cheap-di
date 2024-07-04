import { CircularDependencyError } from './CircularDependencyError.js';
import { findMetadata, findOrCreateMetadata } from './metadata.js';
import { isSingleton } from './isSingleton.js';
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
  RegisteredImplementation,
  RegisteredInstance,
  RegistrationType,
} from './types';

class ContainerImpl
  implements
    Container,
    IHaveSingletons,
    IHaveInstances,
    IHaveDependencies,
    Disposable
{
  singletons: Map<ImplementationType<any>, object>;
  instances: Map<RegistrationType<any>, object>;
  dependencies: Map<RegistrationType<any>, ImplementationType<any> | object>;
  enrichCallbacks: Map<RegistrationType<any> | object, (instance: any) => any>;

  constructor() {
    this.singletons = new Map();
    this.instances = new Map();
    this.dependencies = new Map();
    this.enrichCallbacks = new Map();
  }

  /** register implementation class */
  registerImplementation: Container['registerImplementation'] = <TClass>(
    implementationType: Constructor<TClass>
  ) => {
    this.dependencies.set(implementationType, implementationType);

    let asType: RegistrationType<any> | undefined = undefined;

    const asAnotherType = <TBase>(type: RegistrationType<TBase>) => {
      this.dependencies.delete(implementationType);
      this.dependencies.set(type, implementationType);
      asType = type;

      const enrichCallback = this.enrichCallbacks.get(implementationType);
      if (enrichCallback) {
        this.enrichCallbacks.delete(implementationType);
        this.enrichCallbacks.set(type, enrichCallback);
      }
    };

    const registeredImplementation: RegisteredImplementation<TClass> = {
      as: (type) => {
        asAnotherType(type);
        return registeredImplementation;
      },
      asSingleton: (type) => {
        if (type) {
          asAnotherType(type);
        }

        if (!isSingleton(implementationType)) {
          const metadata = findOrCreateMetadata(
            implementationType as ImplementationType<unknown>
          );
          metadata.modifiedClass = implementationType;
          metadata.singleton = true;
        }

        return registeredImplementation;
      },
      inject: (...injectionParams) => {
        const metadata = findOrCreateMetadata(
          implementationType as ImplementationType<unknown>
        );
        metadata.injected = injectionParams;

        return registeredImplementation;
      },
      enrich: (enrichCallback) => {
        if (asType) {
          this.enrichCallbacks.delete(implementationType);
          this.enrichCallbacks.set(asType, enrichCallback);
        } else {
          this.enrichCallbacks.set(implementationType, enrichCallback);
        }

        return registeredImplementation;
      },
    };

    return registeredImplementation;
  };

  /** register any object as its constructor */
  registerInstance: Container['registerInstance'] = <TInstance extends object>(
    instance: TInstance
  ) => {
    const constructor = instance.constructor as Constructor<TInstance>;
    if (constructor) {
      this.instances.set(constructor, instance);
    }

    let asType: RegistrationType<any> | undefined = undefined;

    const registeredInstance: RegisteredInstance<TInstance> = {
      as: (type) => {
        if (constructor) {
          this.instances.delete(constructor);
        }
        this.instances.set(type, instance);

        asType = type;

        return registeredInstance;
      },
      enrich: (enrichCallback) => {
        if (asType) {
          this.enrichCallbacks.delete(instance);
          this.enrichCallbacks.set(asType, enrichCallback);
        } else {
          this.enrichCallbacks.set(instance, enrichCallback);
        }

        return registeredInstance;
      },
    };

    return registeredInstance;
  };

  /** instantiate (or get instance for singleton) by class */
  resolve<TInstance>(
    type: Constructor<TInstance> | AbstractConstructor<TInstance>,
    ...args: any[]
  ): TInstance | undefined {
    const trace = new Trace(type.name);
    try {
      const resolvedInstance = this.internalResolve(type, trace, ...args);

      const enrichCallback = this.getEnrichCallback(type);
      if (typeof enrichCallback === 'function') {
        return enrichCallback(resolvedInstance);
      }

      return resolvedInstance;
    } catch (error) {
      if (error instanceof RangeError) {
        const tree = trace.build();
        console.warn('cheap-di, circular dependencies tree', tree);
        throw new CircularDependencyError(
          `Circular dependencies during resolve ${type.name}. ${error.message}`
        );
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
    // if it is not a class (function)
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

    const { dependencies, injectDependencies } = metadata ?? {};
    // explicit dependencies has priority over implicit
    const takenDependencies = injectDependencies ?? dependencies;

    if (takenDependencies?.length) {
      const resolvedDependencies: any[] = [];
      const definedDependencies = takenDependencies.filter(
        (dependency) => typeof dependency !== 'string'
      ) as Dependency[];

      while (true) {
        const dependencyType = definedDependencies[index];
        if (dependencyType) {
          trace.addTrace(dependencyType.name);

          const instance = this.internalResolve(dependencyType, trace.trace!);

          const isNewInstance =
            !this.isRegisteredInstance(dependencyType, instance) &&
            !this.isRegisteredType(dependencyType, instance);
          if (
            // todo: can't remember why is it, have to add comment ...
            isNewInstance &&
            injectionParams[injectionParamsIndex] instanceof Object &&
            injectionParams[injectionParamsIndex].constructor === dependencyType
          ) {
            resolvedDependencies[index] = injectionParams[injectionParamsIndex];
            injectionParamsIndex++;
          } else {
            let enrichedInstance = instance;

            const enrichCallback = this.enrichCallbacks.get(dependencyType);
            if (typeof enrichCallback === 'function') {
              enrichedInstance = enrichCallback(instance);
            }

            resolvedDependencies[index] = enrichedInstance;
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
      for (let index = 0; index < takenDependencies.length; index++) {
        const dependency = takenDependencies[index];
        if (typeof dependency === 'string') {
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
              argument != null &&
              typeof argument === 'object' &&
              argument instanceof restParameter.constructor
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

    const target = new (implementation as Constructor)(...injectableArguments);

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

  getEnrichCallback<TInstance>(
    type: Constructor<TInstance> | AbstractConstructor<TInstance>
  ): ((instance: any) => any) | undefined {
    if (this.enrichCallbacks.has(type)) {
      return this.enrichCallbacks.get(type)!;
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
