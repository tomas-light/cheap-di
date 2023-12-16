import { cheapDiSymbol } from './cheapDiSymbol.js';

type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;
type Constructor<T = any> = new (...args: any[]) => T;
type Dependency<T = any> = Constructor<T> | AbstractConstructor<T>;

type SomeDependency = Dependency | string;

type ImplementationType<TClass> = Dependency<TClass> & {
  [cheapDiSymbol]: DiMetadata;
};

interface DiMetadata {
  /** if class was registered as singleton with container.registerImplementation(...).asSingleton)*/
  singleton?: boolean;

  /** constructor dependencies */
  dependencies?: SomeDependency[];

  /** reference on a constructor that was patched (helps in inheritance cases) */
  modifiedClass?: unknown;

  /** parameters are specified with @inject decorator explicitly */
  injectDependencies?: SomeDependency[];

  /** parameters are passed to container.registerImplementation(...).inject(parameter1, parameter2) */
  injected?: unknown[];
}

type RegistrationType<TInstance> = Constructor<TInstance> | AbstractConstructor<TInstance>;

interface WithInjectionParams {
  /** add parameters that will be passed to the class constructor */
  inject: (...injectionParams: any[]) => void;
}

interface DependencyRegistrator<RegisterTypeExtension = object, RegisterInstanceExtension = object> {
  /** register implementation class */
  registerImplementation: <TClass>(implementationType: Constructor<TClass>) => {
    /** as super class */
    as: <TBase extends Partial<TClass>>(type: RegistrationType<TBase>) => WithInjectionParams;

    /** as singleton (optionally super class) */
    asSingleton: <TBase extends Partial<TClass>>(type?: RegistrationType<TBase>) => WithInjectionParams;
  } & WithInjectionParams &
    RegisterTypeExtension;

  /** register any object as it constructor */
  registerInstance: <TInstance extends object>(
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

interface Container<RegisterTypeExtension = object, RegisterInstanceExtension = object>
  extends DependencyRegistrator<RegisterTypeExtension, RegisterInstanceExtension>,
    DependencyResolver {}

interface IHaveSingletons {
  singletons: Map<ImplementationType<any>, object>;
}
interface IHaveInstances {
  instances: Map<RegistrationType<any>, any>;
}
interface IHaveDependencies {
  dependencies: Map<RegistrationType<any>, ImplementationType<any> | object>;
}

export type {
  AbstractConstructor,
  Constructor,
  Container,
  Dependency,
  DependencyRegistrator,
  DependencyResolver,
  DiMetadata,
  IHaveDependencies,
  IHaveInstances,
  IHaveSingletons,
  ImplementationType,
  RegistrationType,
  SomeDependency,
  WithInjectionParams,
};
