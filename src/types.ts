import { singletonSymbol, dependenciesSymbol, injectionSymbol, inheritancePreserveSymbol } from './symbols';

type AbstractConstructor<T = any> = abstract new(...args: any[]) => T;
type Constructor<T = any> = new(...args: any[]) => T;
type Dependency<T = any> = (Constructor<T> | AbstractConstructor<T>);

type ImplementationType<TClass> = Constructor<TClass> & {
  [singletonSymbol]?: boolean;
  [dependenciesSymbol]?: Dependency[];
  [inheritancePreserveSymbol]?: TClass;
};

type ImplementationTypeWithInjection<TInstance> = ImplementationType<TInstance> & {
  [injectionSymbol]?: any[];
};

type RegistrationType<TInstance> = Constructor<TInstance> | AbstractConstructor<TInstance>;

interface DependencyRegistrator {
  registerType:<TClass>(implementationType: ImplementationType<TClass>) => {
    as: <TBase extends Partial<TClass>>(type: RegistrationType<TBase>) => {
      with: (...injectionParams: any[]) => void;
    };
    with: (...injectionParams: any[]) => void;
  };

  registerInstance: <TInstance extends Object>(instance: TInstance) => {
    as: <TBase extends Partial<TInstance>>(type: RegistrationType<TBase>) => void;
  };
}

type Resolver = <TInstance>(type: Constructor<TInstance> | AbstractConstructor<TInstance>, ...args: any[]) => TInstance | undefined;

interface DependencyResolver {
  resolve: Resolver;
  clear(): void;
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
