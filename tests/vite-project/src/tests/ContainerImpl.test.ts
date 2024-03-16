import { container } from 'cheap-di';
import { beforeEach, describe, expect, test, vi } from 'vitest';

beforeEach(() => {
  container.clear();
});

describe('register implementation', () => {
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

    container.registerImplementation(MyService).as(Service);
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

    container.registerImplementation(MyService).as(Service);
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

    container.registerImplementation(MyService).as(Service).inject('some');
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

    container.registerImplementation(MyService).as(Service).inject('some');
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

describe('resolving several dependencies', () => {
  class ApiInterceptor {
    static singleton: ApiInterceptor;

    api?: {
      fetch: () => string;
    };

    constructor(public readonly dispatch: () => any) {
      if (ApiInterceptor.singleton) {
        return ApiInterceptor.singleton;
      }
      ApiInterceptor.singleton = this;

      this.api = {
        fetch: () => {
          this.dispatch();
          return '123';
        },
      };
    }
  }

  class ApiBase {
    constructor(public readonly interceptor: ApiInterceptor) {
      if (!interceptor) {
        throw new Error("Can't instantiate Api. Have not enough arguments.");
      }
    }

    protected get(data: string) {
      return this.interceptor.api!.fetch() + data;
    }
  }

  class MyApi extends ApiBase {
    getData() {
      return this.get('-456');
    }
  }

  const dispatch = vi.fn();
  container.registerImplementation(ApiInterceptor).inject(dispatch);
  container.registerImplementation(MyApi);

  const myApi = container.resolve(MyApi);
  test('api resolved', () => {
    expect(myApi).not.toBe(null);
  });
  test('api has passed parameter', () => {
    expect(myApi!.interceptor).not.toBe(null);
    expect(myApi!.interceptor!.dispatch).not.toBe(null);
  });
  test('api method works', () => {
    expect(myApi!.getData()).toBe('123-456');
    expect(dispatch).toBeCalledTimes(1);
  });
});

test('asSingleton', () => {
  class Service {}

  container.registerImplementation(Service).asSingleton();
  const entity1 = container.resolve(Service);
  const entity2 = container.resolve(Service);
  expect(entity1).toBe(entity2);
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
      constructor(private db: Database) {
        if (!db) {
          throw new Error("Can't instantiate Repository. Have not enough arguments.");
        }
      }

      list() {
        return this.db.entities;
      }
    }

    class Service {
      constructor(private repository: Repository) {
        if (!repository) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
      }

      myList() {
        const entities = this.repository.list();
        return entities.concat('service entity');
      }
    }

    const entities = ['entity 1', 'entity 2'];
    container.registerImplementation(Repository);
    container.registerImplementation(Service);
    container.registerInstance(new Database(entities));

    const service = container.resolve(Service)!;
    const list = service.myList();
    expect(list).toEqual(['entity 1', 'entity 2', 'service entity']);
  });

  test('auto resolve service', () => {
    class Database {
      readonly entities: string[];

      constructor() {
        this.entities = ['default'];
      }
    }

    class Repository {
      constructor(private db: Database) {
        if (!db) {
          throw new Error("Can't instantiate Repository. Have not enough arguments.");
        }
      }

      defaultList() {
        return this.db.entities;
      }
    }

    class Service {
      constructor(private repository: Repository) {
        if (!repository) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
      }

      myList() {
        const entities = this.repository.defaultList();
        return entities.concat('service entity');
      }
    }

    const service = container.resolve(Service)!;
    const list = service.myList();
    expect(list).toEqual(['default', 'service entity']);
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

describe('with decorators', () => {
  class Database {
    readonly entities: string[];

    constructor(entities: string[]) {
      this.entities = entities;
    }
  }

  class Repository {
    constructor(private db: Database) {
      if (!db) {
        throw new Error("Can't instantiate Repository. Have not enough arguments.");
      }
    }

    list() {
      return this.db.entities;
    }
  }

  class Service {
    constructor(private repository: Repository) {
      if (!repository) {
        throw new Error("Can't instantiate Service. Have not enough arguments.");
      }
    }

    myList() {
      const entities = this.repository.list();
      return entities.concat('service entity');
    }
  }

  function check(resolveType: typeof Service) {
    const entities = ['entity 1', 'entity 2'];
    container.registerInstance(new Database(entities));

    const service = container.resolve(resolveType)!;
    const list = service.myList();
    expect(list).toEqual(['entity 1', 'entity 2', 'service entity']);
  }

  beforeEach(() => {
    container.clear();
  });

  test('with inject decorator', () => {
    class _Repository extends Repository {
      constructor(db: Database) {
        super(db);
      }
    }

    class _Service extends Service {
      constructor(repository: _Repository) {
        super(repository);
      }
    }

    check(_Service);
  });

  test('with di decorator', () => {
    class _Repository extends Repository {
      constructor(db: Database) {
        super(db);
      }
    }

    class _Service extends Service {
      constructor(repository: _Repository) {
        super(repository);
      }
    }

    check(_Service);
  });

  test('resolve service', () => {
    class Database {
      readonly entities: string[];

      constructor(entities: string[]) {
        this.entities = entities;
      }
    }

    class Repository {
      constructor(private db: Database) {
        if (!db) {
          throw new Error("Can't instantiate Repository. Have not enough arguments.");
        }
      }

      list() {
        return this.db.entities;
      }
    }

    class Service {
      constructor(private repository: Repository) {
        if (!repository) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
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
    expect(list).toEqual(['entity 1', 'entity 2', 'service entity']);
  });
});

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
      public message2: string
    ) {
      if (!repository) {
        throw new Error("Can't instantiate Service. Have not enough arguments.");
      }
      if (!db) {
        throw new Error("Can't instantiate Service. Have not enough arguments.");
      }
    }

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

  function register(type: typeof Service) {
    const entities = ['entity 1', 'entity 2'];
    container.registerInstance(new Database(entities));
    container.registerImplementation(type).inject(message1, message2);
  }

  function resolveAndCheck(type: typeof Service) {
    const service = container.resolve(type)!;

    const list1 = service.list1();
    expect(list1).toEqual(['test 1', 'test 2', 'service entity']);

    const list2 = service.list2();
    expect(list2).toEqual(['entity 1', 'entity 2', 'service entity']);

    expect(service.message).toBe(message1);
    expect(service.message2).toBe(message2);
  }

  function check(type: typeof Service) {
    register(type);
    resolveAndCheck(type);
  }

  beforeEach(() => {
    container.clear();
  });

  test('case 1', () => {
    class Service1 extends Service {
      constructor(
        public repository: Repository,
        public db: Database,
        message: string,
        message2: string
      ) {
        super(repository, db, message, message2);

        if (!repository) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
        if (!db) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
      }
    }

    check(Service1);
  });

  test('case 2', () => {
    class Service2 extends Service {
      constructor(
        public repository: Repository,
        message: string,
        public db: Database,
        message2: string
      ) {
        super(repository, db, message, message2);

        if (!repository) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
        if (!db) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
      }
    }

    check(Service2 as any);
  });

  test('case 3', () => {
    class Service3 extends Service {
      constructor(
        message: string,
        public repository: Repository,
        public db: Database,
        message2: string
      ) {
        super(repository, db, message, message2);

        if (!repository) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
        if (!db) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
      }
    }

    check(Service3 as any);
  });

  test('case 4', () => {
    class Service4 extends Service {
      constructor(
        message: string,
        public repository: Repository,
        message2: string,
        public db: Database
      ) {
        super(repository, db, message, message2);

        if (!repository) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
        if (!db) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
      }
    }

    check(Service4 as any);
  });

  test('case 5', () => {
    class Service5 extends Service {
      constructor(
        message: string,
        public repository: Repository,
        message2: string,
        public db: Database
      ) {
        super(repository, db, message, message2);

        if (!repository) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
        if (!db) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
      }
    }

    check(Service5 as any);
  });

  test('case 6', () => {
    class AnotherService {
      constructor(private num: number) {}

      some() {
        return this.num;
      }
    }

    class Config {
      prop: string = '';
    }

    const config: Config = {
      prop: 'qwe',
    };

    class Service6 extends Service {
      constructor(
        message: string,
        public repository: Repository,
        public config: Config,
        message2: string,
        public db: Database,
        public anotherService: AnotherService
      ) {
        super(repository, db, message, message2);

        if (!repository) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
        if (!db) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
        if (!anotherService) {
          throw new Error("Can't instantiate Service. Have not enough arguments.");
        }
      }
    }

    const entities = ['entity 1', 'entity 2'];
    container.registerInstance(config).as(Config);
    container.registerInstance(new Database(entities));
    container.registerImplementation(Service6).inject(message1, message2, new AnotherService(2));

    resolveAndCheck(Service6 as any);

    const service = container.resolve(Service6)!;
    // check if DI creates instance, and doesn't pass it as injectionParams
    expect(service.anotherService.some()).toBe(2);
    expect(service.config.prop).toBe('qwe');
  });
});
