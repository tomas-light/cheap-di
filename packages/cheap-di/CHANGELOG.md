# Changelog

## 4.0.0

The release main goal is stop using reflect-metadata as obsoleted (and unstable) approach and become compatible with TypeScript 5.2.0 decorators (stage 3 proposal).

As a bonus we introduce new approach to dependency registration to achieve True dependency injection - <a href="https://github.com/tomas-light/cheap-di/blob/master/packages/cheap-di-ts-transform/README.md">cheap-di-ts-transform</a> package

### 🚧 Breaking changes

* `registerType` method was renamed to `registerImplementation`;

```ts
import { container } from 'cheap-di';

class Foo {}

// before
container.registerType(Foo);

// after
container.registerImplementation(Foo);
```

* parameters injection method was renamed;

```ts
import { container } from 'cheap-di';

class Foo {
  constructor(bar: string) {}
}

// before
container
  .registerType(Foo)
  .with('some message');

// after
container
  .registerImplementation(Foo)
  .inject('some message');
```

* `@inject` decorator was rewritten and its target changed from constructor parameter to constructor itself:

```ts
import { inject } from 'cheap-di';

class Bar {}

// before
class Foo {
  constructor(@inject bar: Bar) {}
}

// after
@inject(Bar)
class Foo {
  constructor(bar: Bar) {}
}
```

* removed `@dependencies` decorator. You may use `@inject` decorator instead of;
* removed `@di` decorator;
* removed `@singleton` decorator. Instead of it you may use:

```ts
import { container } from 'cheap-di';

class Foo {}

// here you have to provide Foo's dependencies by yourself
container.registerInstance(new Foo());

// or

// Foo will be instantiated only once, all consumers will get the same instance
container
  .registerImplementation(Foo)
  .asSingleton(); 
```

* All symbols `dependenciesSymbol`, `singletonSymbol`, `injectionSymbol`, `inheritancePreserveSymbol` were removed, all information now are stored in single `cheapDiSymbol` symbol:

```ts
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
```

### 🚀 Features:

* `@inject` decorator supports stage 2 and stage 3TypeScript decorator syntax;
* get rid of reflect-metadata issues, when your class loses its dependencies in runtime in unpredictable cases;

## 3.5.0

🐛 fix tslib missing dependency for PNP

🔨 change target ECMAScript version from `es6` to `es2016`

🔨 bump dependencies;


## 3.4.3

🔨 Bump dependencies versions (and typescript from v4.7.3 to v4.9.4)

## 3.4.2

Types: 

🔨 changed access level of `getInstance`, `getImplementation`, `getSingletons` methods in `ContainerImpl` to public;

## 3.4.1

Types:

🔨 `container` now is typed as `ContainerImpl`;

## 3.4.0

Types:

🔨 add interfaces `IHaveSingletons`, `IHaveInstances`, `IHaveDependencies`;

🔨 `ContainerImpl` implements new interfaces to be able to implement them in your container;

## 3.3.2

Bugfixes:

🐛 try to get injected params in prototype chain if not found anything in current constructor during resolve;

## 3.3.1

Bugfixes:

🐛 bugfix of dependency auto resolving;

## 3.2.5

Bugfixes:

🐛 revert building for CommonJS;

## 3.2.4

🔨 update dependencies;

## 3.2.3

🔨 fix sources map

## 3.2.1

Bugfixes:

🐛 fix container resolving for instance registered as another class;

🐛 fix container resolving for type, when class was registered as super class;

🐛 fix auto resolving for inherited classes;

## 3.2.0

🚀 add `asSingleton` registration method;

## 3.1.0
Features:

🚀 add `@di` class-decorator;

🚀 update `@singleton` to using `@di`;

🚀 add `clear` method to `DependencyResolver`;

## 3.0.0

* move `parentContainer` field to `cheap-di-react`;
* move `sameParent` method to `cheap-di-react`;
* change access to `singletons` field by `protected`;
* change access to `instances` field by `protected`;
* change access to `dependencies` field by `protected`;
* change access to `getInstance` method by `protected`;
* change access to `getImplementation` method by `protected`;
* change access to `getSingletons` method by `protected`;

## 2.3.0

* prevent decorated setting inheritance (because it's a static field)
* add `getDependencies` method to get settled types


* add `getSingletons` public method to ContainerImpl
* add `isSingleton` method to check if your type. It prevents falsy-singletons, that inherits this field from another class

 
* add `setInjectedParams` method to set params (it's not `@inject` analog), that will be passed after all dependencies in your class
* add `getInjectedParams` method to get injected params

## 2.2.3

* bugfix using of `@inject` in inherited classes

## 2.2.2

* bugfix singletons -> move all singleton registration to root container
* improve instance resolving
* improve `@dependencies` and `@singleton` decorators. it doesn't wrap your class with synthetic class anymore
* change using of `@singleton`
```ts
import { singleton } from 'cheap-di';

@singleton()
class Old {
}

@singleton
class New {
}
```
* add error for circular dependencies with dependency trace

## 2.2.1

* add `@inject` to index import

## 2.2.0

* replace static property names by Symbols:
```ts
import { dependenciesSymbol, singletonSymbol, injectionSymbol } from 'cheap-di';

class Old {
  static __singleton
  static __dependencies
  static __injectionParams
}
class New {
  static [dependenciesSymbol]
  static [singletonSymbol]
  static [injectionSymbol]
}
```

* add `@inject()` parameter-decorator, you can use it instead of `@dependencies()`

before:
```ts
import { dependencies } from 'cheap-di';

@dependencies(Service1, Service2)
class MyClass {
    constructor(
      service1: Service1,
      service2: Service2,
    ) {}
}
```
now:
```ts
import { inject } from 'cheap-di';

class MyClass {
    constructor(
      @inject(Service1) service1: Service1,
      @inject(Service2) service2: Service2,
    ) {}
}
```

## 2.1.0

* add `@singleton` class-decorator

## 2.0.5

* fix type error: for class that contains static members
* fix type error: for type registration with injection params
* fix type error: add abstract constructor for instance registration
* add className property for decorated classes

## 2.0.1

* add Container instantiation (with container nesting)
* add 'dependencies' decorator for TypeScript classes
* bugfixes

## 2.0.0

* rename RegisteredType to RegistrationType
* rename __constructorParams to __dependencies

## 1.1.0

* rename IContainer to Container
* rename IDependencyRegistrator to DependencyRegistrator
* rename IDependencyResolver to DependencyResolver
