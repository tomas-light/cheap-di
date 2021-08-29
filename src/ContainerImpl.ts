import {
  getDependencies,
  getInjectedParams,
  setInjectedParams,
  isSingleton,
  di,
} from './decorators';
import { modifySingleton } from './decorators/singleton';
import { CircularDependencyError } from './errors';
import {
  Constructor,
  Container,
  RegistrationType,
  AbstractConstructor,
  ImplementationType,
  ImplementationTypeWithInjection,
  Dependency,
} from './types';
import { Trace } from './utils';

class ContainerImpl<RegisterTypeExtension = {}, RegisterInstanceExtension = {}>
  implements Container<RegisterTypeExtension, RegisterInstanceExtension> {

  protected singletons: Map<ImplementationTypeWithInjection<any>, Object>;
  protected instances: Map<RegistrationType<any>, any>;
  protected dependencies: Map<RegistrationType<any>, ImplementationTypeWithInjection<any> | Object>;

  constructor() {
    this.singletons = new Map();
    this.instances = new Map();
    this.dependencies = new Map();
  }

  /** register class */
  registerType<TInstance>(implementationType: ImplementationType<TInstance>) {
    const withInjection = (...injectionParams: any[]) => {
      setInjectedParams(implementationType, injectionParams);
    };

    this.dependencies.set(implementationType, implementationType);
    if (!getDependencies(implementationType).length) {
      di(implementationType);
    }

    return {
      /** as super class */
      as: <TBase extends Partial<TInstance>>(type: RegistrationType<TBase>) => {
        this.dependencies.delete(implementationType);
        this.dependencies.set(type, implementationType);
        return {
          /** add parameters that will be passed to the class constructor */
          with: withInjection,
        };
      },
      /** as singleton (optionally super class). Only if you didn't use @singleton decorator */
      asSingleton: <TBase extends Partial<TInstance>>(type?: RegistrationType<TBase>) => {
        if (type) {
          this.dependencies.delete(implementationType);
          this.dependencies.set(type, implementationType);
        }

        if (!isSingleton(implementationType)) {
          modifySingleton(implementationType);
        }

        return {
          /** add parameters that will be passed to the class constructor */
          with: withInjection,
        };
      },
      /** add parameters that will be passed to the class constructor */
      with: withInjection,
      ...({} as RegisterTypeExtension),
    };
  }

  /** register any object as it constructor */
  registerInstance<TInstance extends Object>(instance: TInstance) {
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
      ...({} as RegisterInstanceExtension),
    };
  }

  /** instantiate (or get instance for singleton) by class */
  resolve<TInstance>(type: Constructor<TInstance> | AbstractConstructor<TInstance>, ...args: any[]): TInstance | undefined {
    const trace = new Trace(type.name);
    try {
      return this.internalResolve(type, trace, ...args);
    }
    catch (error) {
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
      return implementation as Object as TInstance;
    }

    if (isSingleton(implementation)) {
      const singletons = this.getSingletons();
      if (singletons.has(implementation)) {
        return singletons.get(implementation) as TInstance;
      }
    }

    trace.implemented = implementation.name;

    let injectableArguments: any[] = [];
    const injectionParams: any[] = [
      ...getInjectedParams(implementation),
      ...args,
    ];

    let index = 0;
    let injectionParamsIndex = 0;

    const dependencies = getDependencies(implementation);
    if (dependencies.length) {
      let has = true;
      const injectableDependencies = dependencies.filter(d => d);
      const length = injectableDependencies.length + injectionParams.length;

      while (has) {
        const dependencyType = dependencies[index];
        if (dependencyType) {
          trace.addTrace(dependencyType.name);

          const instance = this.internalResolve(dependencyType, trace.trace!);
          if (
            !(
              this.isRegisteredInstance(dependencyType, instance)
              || this.isRegisteredType(dependencyType, instance)
            )
            && injectionParams[injectionParamsIndex] instanceof Object
            && injectionParams[injectionParamsIndex].constructor === dependencyType
          ) {
            injectableArguments[index] = injectionParams[injectionParamsIndex];
            injectionParamsIndex++;
          }
          else {
            injectableArguments[index] = instance;
          }
        }
        else if (injectionParams[injectionParamsIndex]) {
          injectableArguments[index] = injectionParams[injectionParamsIndex];
          injectionParamsIndex++;
        }

        index++;

        if (index >= length) {
          has = false;
        }
      }
    }
    else {
      injectableArguments = injectionParams;
    }

    const target = new implementation(...injectableArguments);

    if (isSingleton(implementation)) {
      const singletons = this.getSingletons();
      singletons.set(implementation, target);
    }

    return target;
  }

  protected getInstance<TInstance>(type: Constructor<TInstance> | AbstractConstructor<TInstance>): ImplementationTypeWithInjection<TInstance> | Object | undefined {
    if (this.instances.has(type)) {
      return this.instances.get(type)!;
    }

    return undefined;
  }

  protected getImplementation<TInstance>(type: Constructor<TInstance> | AbstractConstructor<TInstance>): ImplementationTypeWithInjection<TInstance> | Object | undefined {
    if (this.dependencies.has(type)) {
      return this.dependencies.get(type)!;
    }

    return undefined;
  }

  protected getSingletons() {
    return this.singletons;
  }

  private isRegisteredInstance(dependencyType: Dependency, instance: any) {
    return instance === this.getInstance(dependencyType);
  }

  private isRegisteredType(dependencyType: Dependency, instance: any) {
    return instance.constructor === this.getImplementation(dependencyType);
  }
}

function isImplementationType(value: any): value is ImplementationTypeWithInjection<any> {
  return typeof value === 'function';
}

const container: Container = new ContainerImpl();
export {
  ContainerImpl,
  container,
};
