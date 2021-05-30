type AbstractConstructor<T = any> = abstract new(...args: any[]) => T;
type Constructor<T = any> = new(...args: any[]) => T;
type Dependency<T = any> = (Constructor<T> | AbstractConstructor<T>);

type ImplementationType<TInstance> = Constructor<TInstance> & {
  __dependencies?: Dependency[]
};

type ImplementationTypeWithInjection<TInstance> = ImplementationType<TInstance> & {
  __injectionParams?: any[];
};

type RegistrationType<TInstance> = Constructor<TInstance> | AbstractConstructor<TInstance>;

interface DependencyRegistrator {
  registerType:<TInstance>(implementationType: ImplementationType<TInstance>) => {
    as: <TBase extends Partial<TInstance>>(type: RegistrationType<TBase>) => {
      with: (...injectionParams: any[]) => void;
    };
  };

  registerInstance: <TInstance extends Object>(instance: TInstance) => {
    as: <TBase extends Partial<TInstance>>(type: Constructor<TBase>) => void;
  };
}

type Resolver = <TInstance>(type: Constructor<TInstance> | AbstractConstructor<TInstance>, ...args: any[]) => TInstance | undefined;

interface DependencyResolver {
  resolve: Resolver;
}

interface Container extends DependencyRegistrator, DependencyResolver {}

export type {
  AbstractConstructor,
  Constructor,
  Container,
  Dependency,
  DependencyRegistrator,
  DependencyResolver,
  ImplementationType,
  ImplementationTypeWithInjection,
  RegistrationType,
};
