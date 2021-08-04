# cheap-di
JavaScript dependency injection like Autofac in .Net

## How to use

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
import { Logger} from './logger';

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

You have the repository consumer.
To allow DI container inject dependencies in your consumer class you should specify `__dependencies` static property.
That property should contain constructor array in the order of your constructor.

`user-service.js`
```js
import { Logger } from './logger';
import { UserRepository } from './user-repository';

export class UserService {
  static __dependencies = [ UserRepository, Logger ];
  
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

import { ConsoleLogger} from './console-logger';
import { FakeUserRepository } from './fake-user-repository';
import { Logger} from './logger';
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

## TypeScript

`logger.ts`
```ts
export abstract class Logger {
  abstract debug: (message: string) => void;
}
```

`console-logger.ts`
```ts
import { Logger} from './logger';

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
    private logger: Logger
  ) {
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

`@singleton` decorator allows you to inject the same instance everywhere.

`user-service.ts`
```ts
import { singleton } from 'cheap-di';
import { Logger } from './logger';
import { UserRepository } from './user-repository';

@singleton()
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


You can see more examples in `cheap-di/src/container.test.ts`
