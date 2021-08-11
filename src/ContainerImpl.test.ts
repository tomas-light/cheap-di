import { container, ContainerImpl } from './ContainerImpl';
import { dependencies } from './dependencies';
import { singleton } from './singleton';
import { inject } from './inject';

describe('register type', () => {
  test('simple', () => {
    class Service {
      constructor() {
        if (new.target === Service) {
          throw new Error('Cannot construct Service instance directly');
        }
      }

      get(): string {
        throw new Error('Not implemented');
      }
    }

    class MyService extends Service {
      get() {
        return 'some';
      }
    }

    container.registerType(MyService).as(Service);
    const service = container.resolve(Service)!;

    expect(service instanceof Service).toBe(true);
    expect(service instanceof MyService).toBe(true);
    expect(service.get()).toBe('some');
  });

  test('simple with passed arguments', () => {
    class Service {
      constructor() {
        if (new.target === Service) {
          throw new Error('Cannot construct Service instance directly');
        }
      }

      get(): string {
        throw new Error('Not implemented');
      }
    }

    class MyService extends Service {
      private readonly message: string;

      constructor(message: string) {
        super();
        this.message = message;
      }

      get() {
        return this.message;
      }
    }

    container.registerType(MyService).as(Service);
    const service = container.resolve(Service, 'some message')!;

    expect(service instanceof Service).toBe(true);
    expect(service instanceof MyService).toBe(true);
    expect(service.get()).toBe('some message');
  });

  test('simple with params', () => {
    class Service {
      constructor() {
        if (new.target === Service) {
          throw new Error('Cannot construct Service instance directly');
        }
      }

      get(): string {
        throw new Error('Not implemented');
      }
    }

    class MyService extends Service {
      private readonly message: string;

      constructor(message: string) {
        super();
        this.message = message;
      }

      get() {
        return this.message;
      }
    }

    container.registerType(MyService).as(Service).with('some');
    const service = container.resolve(Service)!;

    expect(service instanceof Service).toBe(true);
    expect(service instanceof MyService).toBe(true);
    expect(service.get()).toBe('some');
  });

  test('simple with params and passed arguments', () => {
    class Service {
      constructor() {
        if (new.target === Service) {
          throw new Error('Cannot construct Service instance directly');
        }
      }

      get(): string {
        throw new Error('Not implemented');
      }
    }

    class MyService extends Service {
      private readonly message1: string;
      private readonly message2: string;

      constructor(message1: string, message2: string) {
        super();
        this.message1 = message1;
        this.message2 = message2;
      }

      get() {
        return `${this.message1} ${this.message2}`;
      }
    }

    container.registerType(MyService).as(Service).with('some');
    const service = container.resolve(Service, 'property')!;

    expect(service instanceof Service).toBe(true);
    expect(service instanceof MyService).toBe(true);
    expect(service.get()).toBe('some property');
  });
});

describe('register instance', () => {
  test('simple', () => {
    class Database {
      readonly entities: string[];

      constructor(entities: string[]) {
        this.entities = entities;
      }

      list() {
        return this.entities;
      }
    }

    const entities = ['entity 1', 'entity 2'];
    container.registerInstance(new Database(entities));
    const database = container.resolve(Database)!;

    expect(database instanceof Database).toBe(true);
    expect(database.list()).toBe(entities);
  });

  test('as other', () => {
    class Service {
      readonly entities: string[];

      constructor(entities: string[]) {
        this.entities = entities;
      }

      list(): string[] {
        throw new Error('Not implemented');
      }
    }

    class Database extends Service {
      constructor(entities: string[]) {
        super(entities);
      }

      list() {
        return this.entities;
      }
    }

    const entities = ['entity 1', 'entity 2'];
    container.registerInstance(new Database(entities)).as(Service);

    const database = container.resolve(Database)!;
    expect(database.list()).toBe(undefined);

    const service = container.resolve(Service)!;
    expect(service.list()).toBe(entities);
  });
});

describe('nested resolve', () => {
  test('resolve service', () => {
    class Database {
      readonly entities: string[];

      constructor(entities: string[]) {
        this.entities = entities;
      }
    }

    @dependencies(Database)
    class Repository {
      private db: Database;

      constructor(db: Database) {
        this.db = db;
      }

      list() {
        return this.db.entities;
      }
    }

    @dependencies(Repository)
    class Service {
      private repository: Repository;

      constructor(repository: Repository) {
        this.repository = repository;
      }

      myList() {
        const entities = this.repository.list();
        return entities.concat('service entity');
      }
    }

    const entities = ['entity 1', 'entity 2'];
    container.registerInstance(new Database(entities));

    const service = container.resolve(Service)!;
    const list = service.myList();
    expect(list).toEqual([
      'entity 1',
      'entity 2',
      'service entity',
    ]);
  });

  test('auto resolve service', () => {
    class Database {
      readonly entities: string[];

      constructor() {
        this.entities = ['default'];
      }
    }

    @dependencies(Database)
    class Repository {
      private db: Database;

      constructor(db: Database) {
        this.db = db;
      }

      defaultList() {
        return this.db.entities;
      }
    }

    @dependencies(Repository)
    class Service {
      private repository: Repository;

      constructor(repository: Repository) {
        this.repository = repository;
      }

      myList() {
        const entities = this.repository.defaultList();
        return entities.concat('service entity');
      }
    }

    const service = container.resolve(Service)!;
    const list = service.myList();
    expect(list).toEqual([
      'default',
      'service entity',
    ]);
  });
});

describe('nested containers', () => {
  abstract class Service {
    abstract some(): string;
  }

  class Service1 extends Service {
    some(): string {
      return 'service 1';
    }
  }

  class Service2 extends Service {
    some(): string {
      return 'service 2';
    }
  }

  @dependencies(Service)
  class Consumer {
    constructor(private service: Service) {
    }

    do() {
      return this.service.some();
    }
  }

  const container1 = new ContainerImpl();
  const container2 = new ContainerImpl(container1);
  const container3 = new ContainerImpl(container2);

  container1.registerType(Service1).as(Service);

  test('container 1 -> 3', () => {
    const consumer = container3.resolve(Consumer);
    expect(consumer instanceof Consumer).toBe(true);
    expect(consumer!.do()).toBe('service 1');
  });

  test('container 2 overrides container 1', () => {
    container2.registerType(Service2).as(Service);
    const consumer = container3.resolve(Consumer);
    expect(consumer instanceof Consumer).toBe(true);
    expect(consumer!.do()).toBe('service 2');
  });
});

test('add abstract constructor for instance registration', () => {
  abstract class Config {
    abstract message: string;
  }

  const config: Config = {
    message: '123',
  };

  container.registerInstance(config).as(Config);
  const result = container.resolve(Config);
  expect(result).toBe(config);
});

test('singletones', () => {
  @singleton
  class Service {
  }

  container.registerType(Service);
  const entity1 = container.resolve(Service);
  const entity2 = container.resolve(Service);
  expect(entity1).toBe(entity2);
});

test('with inject decorator', () => {
  class Database {
    readonly entities: string[];

    constructor(entities: string[]) {
      this.entities = entities;
    }
  }

  class Repository {
    private db: Database;

    constructor(@inject(Database) db: Database) {
      this.db = db;
    }

    list() {
      return this.db.entities;
    }
  }

  class Service {
    constructor(@inject(Repository) private repository: Repository) {
    }

    myList() {
      const entities = this.repository.list();
      return entities.concat('service entity');
    }
  }

  const entities = ['entity 1', 'entity 2'];
  container.registerInstance(new Database(entities));

  const service = container.resolve(Service)!;
  const list = service.myList();
  expect(list).toEqual([
    'entity 1',
    'entity 2',
    'service entity',
  ]);
})

describe('arguments order', () => {
  class Database {
    constructor(private readonly entities: string[]) {}
    list() {
      return this.entities;
    }
  }

  class Repository {
    list() {
      return ['test 1', 'test 2'];
    }
  }

  class Service {
    constructor(
      public repository: Repository,
      public db: Database,
      public message: string,
      public message2: string,
    ) {}
    list1() {
      const entities = this.repository.list();
      return entities.concat('service entity');
    }
    list2() {
      const entities = this.db.list();
      return entities.concat('service entity');
    }
  }

  const message1 = '123';
  const message2 = '456';

  function check(service: Service) {
    const list1 = service.list1();
    expect(list1).toEqual([
      'test 1',
      'test 2',
      'service entity',
    ]);

    const list2 = service.list2();
    expect(list2).toEqual([
      'entity 1',
      'entity 2',
      'service entity',
    ]);

    expect(service.message).toBe(message1);
    expect(service.message2).toBe(message2);
  }

  test('case 1', () => {
    class Service1 extends Service {
      constructor(
        @inject(Repository) public repository: Repository,
        @inject(Database) public db: Database,
        message: string,
        message2: string,
      ) {
        super(repository, db, message, message2);
      }
    }

    const entities = ['entity 1', 'entity 2'];
    container.registerInstance(new Database(entities));
    container.registerType(Service1).with(message1, message2);

    const service = container.resolve(Service1)!;
    check(service);
  });

  test('case 2', () => {
    class Service2 extends Service {
      constructor(
        @inject(Repository) public repository: Repository,
        message: string,
        @inject(Database) public db: Database,
        message2: string,
      ) {
        super(repository, db, message, message2);
      }
    }

    const entities = ['entity 1', 'entity 2'];
    container.registerInstance(new Database(entities));
    container.registerType(Service2).with(message1, message2);

    const service = container.resolve(Service2)!;
    check(service);
  });

  test('case 3', () => {
    class Service3 extends Service {
      constructor(
        message: string,
        @inject(Repository) public repository: Repository,
        @inject(Database) public db: Database,
        message2: string,
      ) {
        super(repository, db, message, message2);
      }
    }

    const entities = ['entity 1', 'entity 2'];
    container.registerInstance(new Database(entities));
    container.registerType(Service3).with(message1, message2);

    const service = container.resolve(Service3)!;
    check(service);
  });

  test('case 4', () => {
    class Service4 extends Service {
      constructor(
        message: string,
        @inject(Repository) public repository: Repository,
        message2: string,
        @inject(Database) public db: Database,
      ) {
        super(repository, db, message, message2);
      }
    }

    const entities = ['entity 1', 'entity 2'];
    container.registerInstance(new Database(entities));
    container.registerType(Service4).with(message1, message2);

    const service = container.resolve(Service4)!;
    check(service);
  });
});
