# cheap-di
JavaScript dependency injection like Autofac in .Net

## How to use

You have an interface and its implementation

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
`loger.js`
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

export class ConsoleLogger {
    constructor(prefix) {
        this.prefix = prefix;
    }

    debug(message) {
        console.log(`${this.prefix}: ${message}`);
    }
}
```

You have the repository consumer.
To allow DI container to inject dependencies in your consumer class you should specify `__constructorParams` static property.
That property should contain instance types array in the order of your constructor.

`user-service.js`
```js
import { Logger } from './logger';
import { UserRepository } from './user-repository';

export class UserService {
    static __constructorParams = [ UserRepository, Logger ];

    constructor(userRepository, logger) {
        super();
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
