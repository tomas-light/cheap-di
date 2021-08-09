import { singletonSymbol, dependenciesSymbol, injectionSymbol } from './symbols';
import {
  Constructor,
  Container,
  RegistrationType,
  AbstractConstructor,
  ImplementationType,
  ImplementationTypeWithInjection,
} from './types';

class ContainerImpl implements Container {
  private singletons = new Map<ImplementationTypeWithInjection<any>, Object>();
  private dependencies = new Map<RegistrationType<any>, ImplementationTypeWithInjection<any> | Object>();

  constructor(private parentContainer?: ContainerImpl) {
  }

  sameParent(parentContainer?: ContainerImpl) {
    return this.parentContainer === parentContainer;
  }

  registerType<TInstance>(implementationType: ImplementationType<TInstance>) {
    const withInjection = (...injectionParams: any[]) => {
      (implementationType as ImplementationTypeWithInjection<TInstance>)[injectionSymbol] = injectionParams;
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
      this.dependencies.set(constructor, instance);
    }

    return {
      as: <TBase extends Partial<TInstance>>(type: RegistrationType<TBase>) => {
        if (constructor) {
          this.dependencies.delete(constructor);
        }
        this.dependencies.set(type, instance);
      },
    };
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

  resolve<TInstance>(type: Constructor<TInstance> | AbstractConstructor<TInstance>, ...args: any[]): TInstance | undefined {
    if (typeof type !== 'function') {
      return undefined;
    }

    const implementation = this.getImplementation(type) || type;
    if (!isImplementationType(implementation)) {
      return implementation as Object as TInstance;
    }

    if (implementation[singletonSymbol] && this.singletons.has(implementation)) {
      return this.singletons.get(implementation) as TInstance;
    }

    // const dependencyArguments: any[] = [];
    // if (implementation[dependencies]) {
    //   implementation[dependencies]!.forEach((dependencyType: Constructor | AbstractConstructor) => {
    //     const instance = this.resolve(dependencyType);
    //     dependencyArguments.push(instance);
    //   });
    // }
    //
    // const injectionParams = implementation[injection] || [];
    //
    // const target = new implementation(...[
    //   ...dependencyArguments,
    //   ...injectionParams,
    //   ...args,
    // ]);

    let injectableArguments: any[] = [];
    const injectionParams: any[] = [
      ...(Array.isArray(implementation[injectionSymbol]) ? implementation[injectionSymbol]! : []),
      ...args,
    ];

    let index = 0;
    let injectionParamsIndex = 0;

    if (implementation[dependenciesSymbol]) {
      let has = true;
      const injectableDependencies = implementation[dependenciesSymbol]!.filter(d => d);
      const length = injectableDependencies.length + injectionParams.length;

      while (has) {
        const dependencyType = implementation[dependenciesSymbol]![index];
        if (dependencyType) {
          const instance = this.resolve(dependencyType);
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

    if (implementation[singletonSymbol]) {
      this.singletons.set(implementation, target);
    }

    return target;
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
