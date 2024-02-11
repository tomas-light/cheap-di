import { ReactContainer } from 'cheap-di-react';
import { describe, expect, test } from 'vitest';

test('singleton', async () => {
  class Service {}

  const container = new ReactContainer();
  container.registerImplementation(Service).asSingleton();
  const entity1 = container.resolve(Service);
  const entity2 = container.resolve(Service);
  expect(entity1).toBe(entity2);
});

// because cheap-di-ts-transformer adds `await import(...)` after class declaration with injected dependencies,
// and `await` keyword may be used only inside `async` function
describe('nested containers', async () => {
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

  class Consumer {
    constructor(private service: Service) {}

    do() {
      return this.service.some();
    }
  }

  const container1 = new ReactContainer();
  const container2 = new ReactContainer(container1);
  const container3 = new ReactContainer(container2);

  container1.registerImplementation(Service1).as(Service);

  test('container 1 -> 3', async () => {
    const consumer = container3.resolve(Consumer);
    expect(consumer instanceof Consumer).toBe(true);
    expect(consumer!.do()).toBe('service 1');
  });

  test('container 2 overrides container 1', async () => {
    container2.registerImplementation(Service2).as(Service);
    const consumer = container3.resolve(Consumer);
    expect(consumer instanceof Consumer).toBe(true);
    expect(consumer!.do()).toBe('service 2');
  });

  test('singleton resolving', async () => {
    class Database {
      readonly entities: string[];

      constructor() {
        this.entities = ['entity 1', 'entity 2'];
      }
    }

    class Repository {
      private db: Database;

      constructor(db: Database) {
        this.db = db;
      }

      list() {
        return this.db.entities;
      }
    }

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

    const container = new ReactContainer();
    const service = container.resolve(Service)!;
    const list = service.myList();
    expect(list).toEqual(['entity 1', 'entity 2', 'service entity']);
  });
});
