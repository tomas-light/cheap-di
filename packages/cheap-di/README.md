# cheap-di

JavaScript's dependency injection like Autofac in .Net

* [Minimal Sample (TypeScript)](#minimal-sample)
* [How to use (JavaScript)](#how-to-use)
* [TypeScript](#type-script)
* [Decorators](#decorators)
  * [dependencies](#dependencies)
  * [inject](#inject)
  * [di](#di)
  * [singleton](#singleton)

## <a name="minimal-sample"></a> Minimal Sample (TypeScript)

```ts
abstract class Logger {
  abstract debug: (message: string) => void;
}

class ConsoleLogger implements Logger {
  constructor(prefix) {
    this.prefix = prefix;
  }

  debug(message: string) {
    console.log(`${this.prefix}: ${message}`);
  }
}

const metadata = <T>(constructor: T): T => constructor;

@metadata
class Service {
  constructor(private logger: Logger) {}

  doSome() {
    this.logger.debug('Hello world!');
  }
}

// somewhere

import { container } from 'cheap-di';

const myLogPrefix = 'INFO: ';
container.registerType(ConsoleLogger).as(Logger).with(myLogPrefix);
container.registerType(Service);

const service = container.resolve(Service);
service.doSome();
```

## <a name="how-to-use"></a> How to use (JavaScript)

You have an interface (base/abstract class) and its implementation (derived class)

`user-repository.js`
```js
export class UserRepository {
  constructor() {
    if (new.target === UserRepository) {
      throw new TypeError('Cannot construct UserRepository instance directly');
    }
  }

  list() {
    throw new Error("Not implemented");
  }

  getById(userId) {
    throw new Error("Not implemented");
  }
}
```

`fake-user-repository.js`
```js
import { UserRepository } from './user-repository';

export class FakeUserRepository extends UserRepository {
  constructor() {
    super();
    this.users = [
      {
        id: 1,
        name: 'user-1'
      },
      {
        id: 2,
        name: 'user-2'
      },
    ];
  }

  list() {
    return this.users;
  }

  getById(userId) {
    return this.users.find(user => user.id === userId);
  }
}
```

There is simple logger.

`logger.js`
```js
export class Logger {
  debug(message) {
    throw new Error("Not implemented");
  }
}
```

`console-logger.js`
```js
import { Logger } from './logger';

export class ConsoleLogger extends Logger {
  constructor(prefix) {
    super();
    this.prefix = prefix;
  }

  debug(message) {
    console.log(`${this.prefix}: ${message}`);
  }
}
```

You have the repository consumer. To allow DI container inject dependencies in your consumer class you should
specify `__dependencies` static property. That property should contain constructor array in the order of your
constructor.

`user-service.js`
```js
import { dependenciesSymbol } from 'cheap-di';
import { Logger } from './logger';
import { UserRepository } from './user-repository';

export class UserService {
  static [dependenciesSymbol] = [UserRepository, Logger];

  constructor(userRepository, logger) {
    this.userRepository = userRepository;
    this.logger = logger;
  }

  list() {
    this.logger.debug('Access to users list');
    return this.userRepository.list();
  }

  get(userId) {
    return this.userRepository.getById(userId);
  }
}
```

Dependency registration

`some-config.js`
```js
import { container } from 'cheap-di';
import { ConsoleLogger } from './console-logger';
import { FakeUserRepository } from './fake-user-repository';
import { Logger } from './logger';
import { UserRepository } from './user-repository';

container.registerType(ConsoleLogger).as(Logger).with('most valuable message prefix');
container.registerType(FakeUserRepository).as(UserRepository);
```

To get instance of your service with injected parameters you should call `resolve` method.

`some-place.js`
```js
import { container } from 'cheap-di';
import { UserService } from './user-service';

const service = container.resolve(UserService);
const users = service.list();
```

Your injection parameter can be placed in middle of constructor params. In this case you should put `undefined`
or `null` in `[dependencies]` with accordance order
```js
import { dependenciesSymbol, container } from 'cheap-di';
// ...

export class UserService {
  static [dependenciesSymbol] = [UserRepository, undefined, Logger];

  constructor(userRepository, someMessage, logger) {
    // ...
  }
}

// ...

container.registerType(UserService).with('my injection string');
```

## <a name="type-script"></a> TypeScript

`logger.ts`
```ts
export abstract class Logger {
  abstract debug: (message: string) => void;
}
```

`console-logger.ts`
```ts
import { Logger } from './logger';

export class ConsoleLogger extends Logger {
  constructor(prefix) {
    super();
    this.prefix = prefix;
  }

  debug(message: string) {
    console.log(`${this.prefix}: ${message}`);
  }
}
```

You can use typescript reflection for auto resolve your class dependencies and inject them. 
For that you should add lines below to your `tsconfig.json`:
```
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

and add any class-decorator to your class. For example:

`metadata.ts`
```ts
export const metadata = <T>(constructor: T): T => constructor;
```

`service.ts`
```ts
import { metadata } from './metadata';
import { Logger } from './logger';

@metadata
export class Service {
  constructor(private logger: Logger) {}

  doSome() {
    this.logger.debug('Hello world!');
  }
}
```

But you should explicitly register each type like this to resolve his dependencies by container:
```ts
import { container } from 'cheap-di';
import { Service } from './service';

container.registerType(Service);

const service = container.resolve(Service);
service.doSome();
```

<h3>In this scenario you don't need decorators from next section!</h3>

---

## <a name="decorators"></a> Decorators

If you want to use any of next decorators, you should add line below to your `tsconfig.json`: 
```
"experimentalDecorators": true,
```

### <a name="dependencies"></a> dependencies

`@dependencies` decorator can be used to simplify dependency syntax

`user-service.ts`
```ts
import { dependencies } from 'cheap-di';
import { Logger } from './logger';
import { UserRepository } from './user-repository';

@dependencies(UserRepository, Logger)
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger,
  ) {}

  list() {
    this.logger.debug('Access to users list');
    return this.userRepository.list();
  }

  get(userId) {
    return this.userRepository.getById(userId);
  }
}
```

### <a name="inject"></a> inject

`@inject` decorator can be used instead of `@dependencies` like below:
```ts
import { inject } from 'cheap-di';

export class UserService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(Logger) private logger: Logger,
  ) {}
}
```

This approach allows you to mix dependency with injection params with any order:

```ts
class Service {
  constructor(
    message1: string,
    @inject(Repository) public repository: Repository,
    message2: string,
    @inject(Database) public db: Database,
  ) {
  }
}

const message1 = '123';
const message2 = '456';
container.registerType(Service).with(message1, message2);
```

### <a name="di"></a> di

This decorator uses typescript reflection, so you should add line below to your `tsconfig.json`: 
```
"emitDecoratorMetadata": true,
```

`@di` decorator can be used instead of `@dependencies` and `@inject` like below:
```ts
import { di } from 'cheap-di';

@di
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger,
  ) {}
}

@di
class Service {
  constructor(
    message1: string,
    public repository: UserRepository,
    message2: string,
    public db: Database,
  ) {}
}

const message1 = '123';
const message2 = '456';
container.registerType(Service).with(message1, message2);
```

It automatically adds `@inject` decorators to your service.

### <a name="singleton"></a> singleton

`@singleton` decorator allows you to inject the same instance everywhere.

```ts
import { singleton } from 'cheap-di';
import { Logger } from './logger';
import { UserRepository } from './user-repository';

@singleton
export class UserService {
  names: string[];

  constructor() {
    this.names = [];
  }

  list() {
    return this.names;
  }

  add(name: string) {
    this.names.push(name);
  }
}
```


You can see more examples in `cheap-di/src/ContainerImpl.test.ts`

[Changelog](../../CHANGELOG.md)
