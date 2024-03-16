import { cheapDiSymbol } from './cheapDiSymbol';

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

type AsBase<TClass, ReturnType> = <TBase extends Partial<TClass>>(type: RegistrationType<TBase>) => ReturnType;

type AsSingleton<TClass, ReturnType> = <TBase extends Partial<TClass>>(type?: RegistrationType<TBase>) => ReturnType;

type Enrich<TInstance, ReturnType> = <EnrichedInstance extends TInstance>(
  enrichCallback: (instance: TInstance) => EnrichedInstance
) => ReturnType;

type Inject<ReturnType> = (...injectionParams: any[]) => ReturnType;

interface RegisteredImplementation<TClass> {
  /** as super class */
  as: AsBase<TClass, this>;
  /** as singleton (optionally super class) */
  asSingleton: AsSingleton<TClass, this>;
  /** enrich instance when it will be resolved, for example, if you want to wrap instance with Proxy */
  enrich: Enrich<TClass, this>;
  /** add parameters that will be passed to the class constructor */
  inject: Inject<this>;
}

interface RegisteredInstance<TInstance> {
  /** or register the object as any class */
  as: AsBase<TInstance, this>;
  /** enrich instance when it will be resolved, for example, if you want to extend it but not right now, and only when it will be resolved */
  enrich: Enrich<TInstance, this>;
}

interface DependencyRegistrator<RegisterTypeExtension = object, RegisterInstanceExtension = object> {
  /** register implementation class */
  registerImplementation: <TClass>(
    implementationType: Constructor<TClass>
  ) => RegisteredImplementation<TClass> & RegisterTypeExtension;

  /** register any object as it constructor */
  registerInstance: <TInstance extends object>(
    instance: TInstance
  ) => RegisteredInstance<TInstance> & RegisterInstanceExtension;
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
  RegisteredImplementation,
  RegisteredInstance,
  AsBase,
  AsSingleton,
  Enrich,
  Inject,
};
