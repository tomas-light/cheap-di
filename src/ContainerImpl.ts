import { getDependencies } from './dependencies';
import { CircularDependencyError } from './errors';
import { getInjectedParams, setInjectedParams } from './inject';
import { isSingleton } from './singleton';
import {
  Constructor,
  Container,
  RegistrationType,
  AbstractConstructor,
  ImplementationType,
  ImplementationTypeWithInjection,
} from './types';
import { Trace } from './utils';

class ContainerImpl implements Container {
  private singletons: Map<ImplementationTypeWithInjection<any>, Object>;
  private instances: Map<RegistrationType<any>, any>;
  private dependencies: Map<RegistrationType<any>, ImplementationTypeWithInjection<any> | Object>;

  constructor(private parentContainer?: ContainerImpl) {
    this.singletons = new Map();
    this.instances = new Map();
    this.dependencies = new Map();
  }

  sameParent(parentContainer?: ContainerImpl) {
    return this.parentContainer === parentContainer;
  }

  registerType<TInstance>(implementationType: ImplementationType<TInstance>) {
    const withInjection = (...injectionParams: any[]) => {
      setInjectedParams(implementationType, injectionParams);
    };

    this.dependencies.set(implementationType, implementationType);
    return {
      as: <TBase extends Partial<TInstance>>(type: RegistrationType<TBase>) => {
        this.dependencies.delete(implementationType);
        this.dependencies.set(type, implementationType);
        return {
          with: withInjection,
        };
      },
      with: withInjection,
    };
  }

  registerInstance<TInstance extends Object>(instance: TInstance) {
    const constructor = instance.constructor as Constructor<TInstance>;
    if (constructor) {
      this.instances.set(constructor, instance);
    }

    return {
      as: <TBase extends Partial<TInstance>>(type: RegistrationType<TBase>) => {
        if (constructor) {
          this.instances.delete(constructor);
        }
        this.instances.set(type, instance);
      },
    };
  }

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
          injectableArguments[index] = instance;
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

  private getInstance<TInstance>(type: Constructor<TInstance> | AbstractConstructor<TInstance>): ImplementationTypeWithInjection<TInstance> | Object | undefined {
    if (this.instances.has(type)) {
      return this.instances.get(type)!;
    }

    if (this.parentContainer) {
      return this.parentContainer.getInstance(type);
    }

    return undefined;
  }

  private getImplementation<TInstance>(type: Constructor<TInstance> | AbstractConstructor<TInstance>): ImplementationTypeWithInjection<TInstance> | Object | undefined {
    if (this.dependencies.has(type)) {
      return this.dependencies.get(type)!;
    }

    if (this.parentContainer) {
      return this.parentContainer.getImplementation(type);
    }

    return undefined;
  }

  getSingletons() {
    const rootContainer = this.findRootContainer();
    return rootContainer.singletons;
  }

  private findRootContainer(): ContainerImpl {
    if (this.parentContainer) {
      return this.parentContainer.findRootContainer();
    }

    return this;
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
