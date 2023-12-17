# cheap-di

JavaScript's dependency injection is like Autofac in .Net

* [Installation](#installation)
* [How to use](#how-to-use)
* [Using with abstractions](#using-abstractions)
* [Registration variants](#registration-variants)
  * [registerImplementation](#register-implementation)
  * [registerInstance](#register-instance)

## <a name="installation"></a> Installation

```shell
npm i cheap-di
```

## <a name="how-to-use"></a> How to use

The recommended way of using this package is to use it with code transformers like <a href="https://github.com/tomas-light/cheap-di/tree/master/packages/cheap-di-ts-transform">cheap-di-ts-transform</a>. Because in this way, you will get true dependency injection:
```ts
import { container } from 'cheap-di';

class MyLogger {
  log(...message: unknown[]) {
    console.log(...message);
  }
}

class MyService {
  constructor(private logger: MyLogger) {}
  someStaff() {
    this.logger.log('I do something');
  }
}
/**
 * With cheap-di-ts-transform here will be added metadata about Service dependencies.
 * */

// in this case you have no abstractions, so you don't need to registrate something yourself,
// just resolve your target:
const myService = container.resolve(MyService);
if (myService) {
  myService.someStaff();
}
```

If you can't use <a href="https://github.com/tomas-light/cheap-di/tree/master/packages/cheap-di-ts-transform">cheap-di-ts-transform</a>, you have to use `@inject` decorator to define your dependencies (<i>it supports stage 2 and stage 3 TypeScript syntax</i>):
```ts
import { container, inject } from 'cheap-di';

class MyLogger {
  log(...message: unknown[]) {
    console.log(...message);
  }
}

@inject(MyLogger)
class MyService {
  constructor(private logger: MyLogger) {}
  someStaff() {
    this.logger.log('I do something');
  }
}

// in this case you have no abstractions, so you don't need to registrate something yourself,
// just resolve your target:
const myService = container.resolve(MyService);
if (myService) {
  myService.someStaff();
}
```

## <a name="using-abstractions"></a> Using with abstractions

> Note:
> You may wonder why we use abstract classes?
> - It is syntax analog of interface.
> 
> But why don't we use interfaces?
> - Because we need some unique "token" compatible with JavaScript, to be able to register and resolve implementations. You can't use TypeScript interface in runtime (because it doesn't exists in JavaScript), and you can use classes!
> 
> Some another DI libraries use symbols to achieve that, but we don't see necessity to map somewhere symbols with implementations if we may use only classes everywhere. Less code -> less issues.

```ts
// logger.ts
abstract class Logger {
  abstract debug: (message: string) => void;
}

class ConsoleLogger implements Logger {
  constructor(public prefix: string) {}

  debug(message: string) {
    console.log(`${this.prefix}: ${message}`);
  }
}
```
```ts
// service.ts
import { Logger } from './logger';

class Service {
  constructor(private logger: Logger) {}

  doSome() {
    this.logger.debug('Hello world!');
  }
}
```
```ts
// somewhere in your application initialization
import { container } from 'cheap-di';
import { Logger, ConsoleLogger } from './logger';

const myLogPrefix = 'INFO: ';
container.registerImplementation(ConsoleLogger).as(Logger).inject(myLogPrefix);
```
```ts
// somewhere inside your code
// or you may use some middleware to do this, to get rid of Service Locator antipattern
import { container } from 'cheap-di';
import { Service } from './service';

const service = container.resolve(Service);
service.doSome();
```

Without <a href="https://github.com/tomas-light/cheap-di/tree/master/packages/cheap-di-ts-transform">cheap-di-ts-transform</a>, you still may use cheap-di with `@inject` decorator (it supports stage 2 and stage 3 TypeScript syntax):

```ts
import { inject } from 'cheap-di';

abstract class SessionAccessor {
  abstract getSession(): string;
}

abstract class Logger {
  abstract debug(message: string): void;
}
abstract class InfoLogger extends Logger {}
abstract class ErrorLogger extends Logger {}

// non-classes-arguments specified as "unknown" (or any other string)
// we use `dependencies.filter((dependency) => typeof dependency !== 'string'))` code to filter non-clases dependencies
@inject('unknown', SessionAccessor)
class ConsoleLogger implements Logger {
  constructor(public prefix: string, private sessionAccessor: SessionAccessor) {}

  debug(message: string) {
    console.log(`[${this.sessionAccessor.getSession()}] ${this.prefix}: ${message}`);
  }
}

@inject(InfoLogger)
class Service {
  constructor(private logger: InfoLogger) {}

  doSome() {
    this.logger.debug('Hello world!');
  }
}
```
```ts
// somewhere
import { container } from 'cheap-di';
import { InfoLogger, ErrorLogger, ConsoleLogger } from './logger';

const infoPrefix = 'INFO: ';
container.registerImplementation(ConsoleLogger).as(InfoLogger).inject(infoPrefix);

const errorPrefix = 'ERROR: ';
container.registerImplementation(ConsoleLogger).as(ErrorLogger).inject(errorPrefix);
```
```ts
// somewhere in inside your code
// or you may use some middleware to do this, to get rid of Service Locator antipattern
import { container } from 'cheap-di';
import { Service } from './service';

const service = container.resolve(Service);
service.doSome();
```

To use stage 2 decorators, you need to adjust your tsconfig.json like this:
```json
{
  "compilerOptions": {
    // ...
    "experimentalDecorators": true
  }
}
```

To use stage 3 decorators, you don't need extra setup.

## <a name="registration-variants"></a> Registration variants

#### <a name="register-implementation"></a> registerImplementation

If you would like to specify implementation of your interface:
```ts
import { container } from 'cheap-di';

abstract class Service {/**/}
class ServiceImpl extends Service {/**/}

container
  .registerImplementation(ServiceImpl)
  .as(Service);
```

Or if you want to inject some parameters to its constructor:
```ts
import { container } from 'cheap-di';

class Foo {
  constructor(private name: string) {}
}

container
  .registerImplementation(Foo)
  .inject('some name');
```

Or if you want to have only one instance of the implementation class:
```ts
import { container } from 'cheap-di';

class Foo {}

container
  .registerImplementation(Foo)
  .asSingleton();
```

And singletons may also be used with interface specifications:
```ts
import { container } from 'cheap-di';

abstract class Service {/**/}
class ServiceImpl extends Service {/**/}

container
  .registerImplementation(ServiceImpl)
  .asSingleton(Service);
```

And even with argument injection:
```ts
import { container } from 'cheap-di';

abstract class Service {/**/}

class ServiceImpl extends Service {
  constructor(private name: string) {
    super();
  }
}

container
  .registerImplementation(ServiceImpl)
  .asSingleton(Service)
  .inject('some name');
```

#### <a name="register-instance"></a> registerInstance

If you want to register some instance as an interface, the result is similar to singleton registration, except that you have to instantiate the class yourself.

```ts
import { container } from 'cheap-di';

class Database {
  get() {
    return Promise.resolve('name1');
  }
}

container
  .registerInstance(new Database())
  .as(Database);
```

And you may use any object value as instance

```ts
import { container } from 'cheap-di';

abstract class Database {
  abstract get(): Promise<string>;
}

const db: Database = {
  async get() {
    return Promise.resolve('name1');
  },
};

container
  .registerInstance(db)
  .as(Database);
```

You can see more examples of container methods in <a href="https://github.com/tomas-light/cheap-di/blob/master/tests/jest-test/src/ContainerImpl.test.ts">ContainerImpl.test.ts</a>

[Changelog](./CHANGELOG.md)
