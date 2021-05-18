import { Constructor } from './Constructor';
import { ImplementationType } from './ImplementationType';
import { RegistrationType } from './RegistrationType';

export type InstanceRegistration<T = any> = { as: (type: Constructor<T>) => void; }

export interface DependencyRegistrator {
  registerType: <TInstance,
    TImplementationType extends ImplementationType<TInstance>>(implementationType: TImplementationType) => {
    as: (type: RegistrationType<TInstance>) => {
      with: (...injectionParams: any[]) => void;
    };
  };

  registerInstance: <TInstance extends Object>(instance: TInstance) => TInstance extends infer TBaseInstance
    ? InstanceRegistration<TBaseInstance>
    : never;
}
