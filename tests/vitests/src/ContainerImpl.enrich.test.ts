import { container } from 'cheap-di';
import { beforeEach, describe, expect, test } from 'vitest';

beforeEach(() => {
  container.clear();
});

describe('enrich callbacks', () => {
  test('if instance is wrapped with Proxy when it is registered as itself', () => {
    class Api {
      getUsers() {
        return ['user-1', 'user-2'];
      }
      getRoles() {
        return ['role-3', 'role-4'];
      }
    }

    const usedMethods: string[] = [];

    container.registerImplementation(Api).enrich((api) => {
      return new Proxy(api, {
        get(instance, propertyName) {
          usedMethods.push(propertyName.toString());
          return instance[propertyName as keyof typeof instance];
        },
      });
    });
    const api = container.resolve(Api)!;

    expect(api.getUsers()).toEqual(['user-1', 'user-2']);
    expect(api.getRoles()).toEqual(['role-3', 'role-4']);
    expect(usedMethods).toEqual(['getUsers', 'getRoles']);
  });

  test('if instance is wrapped with Proxy when it is registered as something else', () => {
    abstract class Api {
      abstract getUsers(): string [];
      abstract getRoles(): string [];
    }

    class ApiImpl extends Api {
      getUsers() {
        return ['user-1', 'user-2'];
      }
      getRoles() {
        return ['role-3', 'role-4'];
      }
    }

    const usedMethods: string[] = [];

    container.registerImplementation(ApiImpl).as(Api).enrich((api) => {
      return new Proxy(api, {
        get(instance, propertyName) {
          usedMethods.push(propertyName.toString());
          return instance[propertyName as keyof typeof instance];
        },
      });
    });
    const api = container.resolve(Api)!;

    expect(api.getUsers()).toEqual(['user-1', 'user-2']);
    expect(api.getRoles()).toEqual(['role-3', 'role-4']);
    expect(usedMethods).toEqual(['getUsers', 'getRoles']);
  });

  test('if instance is wrapped with Proxy when it is registered as singleton of something else', () => {
    abstract class Api {
      abstract getUsers(): string [];
      abstract getRoles(): string [];
    }

    class ApiImpl extends Api {
      getUsers() {
        return ['user-1', 'user-2'];
      }
      getRoles() {
        return ['role-3', 'role-4'];
      }
    }

    const usedMethods: string[] = [];

    container.registerImplementation(ApiImpl).asSingleton(Api).enrich((api) => {
      return new Proxy(api, {
        get(instance, propertyName) {
          usedMethods.push(propertyName.toString());
          return instance[propertyName as keyof typeof instance];
        },
      });
    });
    const api = container.resolve(Api)!;

    expect(api.getUsers()).toEqual(['user-1', 'user-2']);
    expect(api.getRoles()).toEqual(['role-3', 'role-4']);
    expect(usedMethods).toEqual(['getUsers', 'getRoles']);
  });
});
