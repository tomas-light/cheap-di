# Changelog

### 3.0.0

* move `parentContainer` field to `cheap-di-react`;
* move `sameParent` method to `cheap-di-react`;
* change access to `singletons` field by `protected`;
* change access to `instances` field by `protected`;
* change access to `dependencies` field by `protected`;
* change access to `getInstance` method by `protected`;
* change access to `getImplementation` method by `protected`;
* change access to `getSingletons` method by `protected`;

### 2.3.0

* prevent decorated setting inheritance (because it's a static field)
* add `getDependencies` method to get settled types


* add `getSingletons` public method to ContainerImpl
* add `isSingleton` method to check if your type. It prevents falsy-singletons, that inherits this field from another class

 
* add `setInjectedParams` method to set params (it's not `@inject` analog), that will be passed after all dependencies in your class
* add `getInjectedParams` method to get injected params

### 2.2.3

* bugfix using of `@inject` in inherited classes

### 2.2.2

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

### 2.2.1

* add `@inject` to index import

### 2.2.0

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

* add `@inject()` decorator, you can use it instead of `@dependencies()`

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

### 2.1.0

* add singleton decorator

### 2.0.5

* fix type error: for class that contains static members
* fix type error: for type registration with injection params
* fix type error: add abstract constructor for instance registration
* add className property for decorated classes

### 2.0.1

* add Container instantiation (with container nesting)
* add 'dependencies' decorator for TypeScript classes
* bugfixes

### 2.0.0

* rename RegisteredType to RegistrationType
* rename __constructorParams to __dependencies

### 1.1.0

* rename IContainer to Container
* rename IDependencyRegistrator to DependencyRegistrator
* rename IDependencyResolver to DependencyResolver
