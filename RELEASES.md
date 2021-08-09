# Releases

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
