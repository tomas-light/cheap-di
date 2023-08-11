import { cheapDiSymbol } from './cheapDiSymbol';

type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;
type Constructor<T = any> = new (...args: any[]) => T;
type Dependency<T = any> = Constructor<T> | AbstractConstructor<T>;

type ImplementationType<TClass> = Constructor<TClass> & {
  [cheapDiSymbol]?: {
    singleton?: boolean;
    dependencies?: Dependency[];
    modifiedClass?: TClass;
    injected?: unknown[];
  };
};

type RegistrationType<TInstance> = Constructor<TInstance> | AbstractConstructor<TInstance>;

interface WithInjectionParams {
  /** add parameters that will be passed to the class constructor */
  with: (...injectionParams: any[]) => void;
}

interface DependencyRegistrator<RegisterTypeExtension = {}, RegisterInstanceExtension = {}> {
  /** register class */
  registerType: <TClass>(implementationType: ImplementationType<TClass>) => {
    /** as super class */
    as: <TBase extends Partial<TClass>>(type: RegistrationType<TBase>) => WithInjectionParams;

    /** as singleton (optionally super class) */
    asSingleton: <TBase extends Partial<TClass>>(type?: RegistrationType<TBase>) => WithInjectionParams;
  } & WithInjectionParams &
    RegisterTypeExtension;

  /** register any object as it constructor */
  registerInstance: <TInstance extends Object>(
    instance: TInstance
  ) => {
    /** or register the object as any class */
    as: <TBase extends Partial<TInstance>>(type: RegistrationType<TBase>) => void;
  } & RegisterInstanceExtension;
}

type Resolver = <TInstance>(
  type: Constructor<TInstance> | AbstractConstructor<TInstance>,
  ...args: any[]
) => TInstance | undefined;

interface DependencyResolver {
  /** instantiate (or get instance for singleton) by class */
  resolve: Resolver;

  /** clear all registered classes and instances */
  clear(): void;
}

interface Container<RegisterTypeExtension = {}, RegisterInstanceExtension = {}>
  extends DependencyRegistrator<RegisterTypeExtension, RegisterInstanceExtension>,
    DependencyResolver {}

interface IHaveSingletons {
  singletons: Map<ImplementationType<any>, Object>;
}
interface IHaveInstances {
  instances: Map<RegistrationType<any>, any>;
}
interface IHaveDependencies {
  dependencies: Map<RegistrationType<any>, ImplementationType<any> | Object>;
}

export type {
  AbstractConstructor,
  Constructor,
  Container,
  Dependency,
  DependencyRegistrator,
  DependencyResolver,
  ImplementationType,
  RegistrationType,
  WithInjectionParams,
  IHaveSingletons,
  IHaveInstances,
  IHaveDependencies,
};
