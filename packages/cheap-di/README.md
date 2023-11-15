# cheap-di

JavaScript's dependency injection like Autofac in .Net

* [How to use](#how-to-use)
* [Registration variants](#registration-variants)
  * [registerImplementation](#register-implementation)
  * [registerInstance](#register-instance)

## <a name="how-to-use"></a> How to use

The recommended way of using this package is using it with code transformers like `cheap-di-ts-transform`. Because in this way you will get the truly dependency injection:

```ts
abstract class Logger {
  abstract debug: (message: string) => void;
}

class ConsoleLogger implements Logger {
  constructor(public prefix: string) {}

  debug(message: string) {
    console.log(`${this.prefix}: ${message}`);
  }
}

class Service {
  constructor(private logger: Logger) {}

  doSome() {
    this.logger.debug('Hello world!');
  }
}
/**
 * With cheap-di-ts-transform here will be added information about Service dependencies.
 * It will looks like:
 * @example
 * import { findOrCreateMetadata } from 'cheap-di';
 * 
 * // for Logger
 * try {
 *   const metadata = findOrCreateMetadata(Logger);
 *
 *   // only classes may be instantiated with DI, other parameters can be filled with argument injection
 *   metadata.dependencies = ["unknown"];
 * } catch {}
 *
 * // for Service
 * try {
 *   const metadata = findOrCreateMetadata(Service);
 *
 *   metadata.dependencies = [Logger];
 * } catch {}
 * */ 

// somewhere in you application initialization
import { container } from 'cheap-di';

const myLogPrefix = 'INFO: ';
container.registerType(ConsoleLogger).as(Logger).with(myLogPrefix);

// somewhere in inside your code
// or you may use some middleware to do this, to get rid of Service Locator antipattern
import { container } from 'cheap-di';

const service = container.resolve(Service);
service.doSome();
```

But if you can't use transformers you still may use cheap-di with decorators:

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

// non-classes-arguments specified as "unknown"
@inject('unknown', SessionAccessor)
class ConsoleLogger implements Logger {
  constructor(public prefix: string, private sessionAccessor: SessionAccessor) {}

  debug(message: string) {
    console.log(`[${this.sessionAccessor.getSession()}] ${this.prefix}: ${message}`);
  }
}

class Service {
  constructor(private logger: InfoLogger) {}

  doSome() {
    this.logger.debug('Hello world!');
  }
}

// somewhere
import { container } from 'cheap-di';

const infoPrefix = 'INFO: ';
container.registerType(ConsoleLogger).as(InfoLogger).with(infoPrefix);

const errorPrefix = 'ERROR: ';
container.registerType(ConsoleLogger).as(ErrorLogger).with(errorPrefix);

// somewhere in inside your code
// or you may use some middleware to do this, to get rid of Service Locator antipattern
import { container } from 'cheap-di';

const service = container.resolve(Service);
service.doSome();
```

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

class Some {
  constructor(private name: string) {}
}

container
  .registerImplementation(Service)
  .inject('some name');
```

Or if you want to have only one instance of the implementation class:
```ts
import { container } from 'cheap-di';

class Some {}

container
  .registerImplementation(Service)
  .asSingleton();
```

And singleton also may be used with interface specification:
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

If you want to register some instance as interface

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

container.registerInstance(db).as(Database);
```


You can see more examples in `cheap-di/src/ContainerImpl.test.ts`

[Changelog](../../CHANGELOG.md)
