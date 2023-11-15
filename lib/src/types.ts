import { cheapDiSymbol } from './cheapDiSymbol.js';

type AbstractConstructor<T = any> = abstract new (...args: any[]) => T;
type Constructor<T = any> = new (...args: any[]) => T;
type Dependency<T = any> = Constructor<T> | AbstractConstructor<T>;

type ImplementationType<TClass> = Constructor<TClass> & {
  [Symbol.metadata]: DiMetadataStorage<TClass>;
};

type DiMetadataStorage<TClass> = {
  [cheapDiSymbol]?: DiMetadata<TClass>;
};

interface DiMetadata<TClass> {
  singleton?: boolean;
  dependencies?: Dependency[];
  modifiedClass?: TClass;
  injected?: unknown[];
}

type RegistrationType<TInstance> = Constructor<TInstance> | AbstractConstructor<TInstance>;

interface WithInjectionParams {
  /** add parameters that will be passed to the class constructor */
  with: (...injectionParams: any[]) => void;
}

interface DependencyRegistrator<RegisterTypeExtension = object, RegisterInstanceExtension = object> {
  /** register class */
  registerType: <TClass>(implementationType: ImplementationType<TClass>) => {
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
  DiMetadataStorage,
  IHaveDependencies,
  IHaveInstances,
  IHaveSingletons,
  ImplementationType,
  RegistrationType,
  WithInjectionParams,
};
