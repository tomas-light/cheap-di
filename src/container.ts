import {
  Constructor,
  Container,
  RegistrationType,
  InstanceRegistration,
} from './types';
import { AbstractConstructor } from './types/AbstractConstructor';
import { ImplementationType } from './types/ImplementationType';
import { ImplementationTypeWithInjection } from './types/ImplementationTypeWithInjection';

const dependencies = new Map<RegistrationType<any>, ImplementationTypeWithInjection<any> | Object>();

const container: Container = {
  registerType: function <
    TInstance,
    TImplementationType extends ImplementationType<TInstance>
  >(implementationType: TImplementationType) {
    return {
      as: (type: RegistrationType<TInstance>) => {
        if (dependencies.has(type)) {
          throw new Error(`The instance type (${type.name}) is already registered`);
        }
        dependencies.set(type, implementationType);

        return {
          with: (...injectionParams: any[]) => {
            (implementationType as ImplementationTypeWithInjection<TInstance>).__injectionParams = injectionParams;
          },
        };
      },
    };
  },

  registerInstance: function <TInstance extends Object>(instance: TInstance): any {
    const constructor = instance.constructor as Constructor<TInstance>;

    if (constructor) {
      if (dependencies.has(constructor)) {
        throw new Error(`The instance type (${constructor.name}) is already registered`);
      }
      dependencies.set(constructor, instance);
    }

    const registration: InstanceRegistration = {
      as: (type) => {
        if (constructor) {
          dependencies.delete(constructor);
        }
        if (dependencies.has(type)) {
          throw new Error(`The instance type (${type.name}) is already registered`);
        }
        dependencies.set(type, instance);
      },
    };

    return registration;
  },

  resolve: function <TInstance>(type: Constructor<TInstance> | AbstractConstructor<TInstance>, ...args: any[]): TInstance | undefined {
    if (typeof type !== 'function') {
      return undefined;
    }

    let implementation: ImplementationTypeWithInjection<TInstance> | Object | undefined = type;
    if (dependencies.has(type)) {
      implementation = dependencies.get(type)!;
    }

    if (!isImplementationType(implementation)) {
      return implementation as Object as TInstance;
    }

    const dependencyArguments: any[] = [];
    if (implementation.__dependencies) {
      implementation.__dependencies.forEach((dependencyType: Constructor | AbstractConstructor) => {
        const instance = container.resolve(dependencyType);
        dependencyArguments.push(instance);
      });
    }

    const injectionParams = implementation.__injectionParams || [];

    return new implementation(...[
      ...dependencyArguments,
      ...injectionParams,
      ...args,
    ]);
  },
};

function isImplementationType(value: any): value is ImplementationTypeWithInjection<any> {
  return typeof value === 'function';
}

export { container };
