import { container } from './container';

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

    class Repository {
      static __dependencies: InstanceType<any>[] = [Database];
      private db: Database;

      constructor(db: Database) {
        this.db = db;
      }

      list() {
        return this.db.entities;
      }
    }

    class Service {
      static __dependencies: InstanceType<any>[] = [Repository];
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

    class Repository {
      static __dependencies: InstanceType<any>[] = [Database];
      private db: Database;

      constructor(db: Database) {
        this.db = db;
      }

      defaultList() {
        return this.db.entities;
      }
    }

    class Service {
      static __dependencies: InstanceType<any>[] = [Repository];
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
