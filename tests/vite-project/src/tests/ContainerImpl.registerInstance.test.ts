import { container } from 'cheap-di';
import { beforeEach, expect, test } from 'vitest';

beforeEach(() => {
  container.clear();
});

test('register instance', () => {
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
