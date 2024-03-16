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
      abstract getUsers(): string[];
      abstract getRoles(): string[];
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

    container
      .registerImplementation(ApiImpl)
      .as(Api)
      .enrich((api) => {
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

  test('if instance is wrapped with Proxy when it is registered as something else ("enrich" called before "as")', () => {
    abstract class Api {
      abstract getUsers(): string[];
      abstract getRoles(): string[];
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

    container
      .registerImplementation(ApiImpl)
      .enrich((api) => {
        return new Proxy(api, {
          get(instance, propertyName) {
            usedMethods.push(propertyName.toString());
            return instance[propertyName as keyof typeof instance];
          },
        });
      })
      .as(Api);
    const api = container.resolve(Api)!;

    expect(api.getUsers()).toEqual(['user-1', 'user-2']);
    expect(api.getRoles()).toEqual(['role-3', 'role-4']);
    expect(usedMethods).toEqual(['getUsers', 'getRoles']);
  });

  test('if instance is wrapped with Proxy when it is registered as singleton of something else', () => {
    abstract class Api {
      abstract getUsers(): string[];
      abstract getRoles(): string[];
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

    container
      .registerImplementation(ApiImpl)
      .asSingleton(Api)
      .enrich((api) => {
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

  test('if instance is wrapped with Proxy when it is registered as singleton of something else ("enrich" called before "asSingleton")', () => {
    abstract class Api {
      abstract getUsers(): string[];
      abstract getRoles(): string[];
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

    container
      .registerImplementation(ApiImpl)
      .enrich((api) => {
        return new Proxy(api, {
          get(instance, propertyName) {
            usedMethods.push(propertyName.toString());
            return instance[propertyName as keyof typeof instance];
          },
        });
      })
      .asSingleton(Api);
    const api = container.resolve(Api)!;

    expect(api.getUsers()).toEqual(['user-1', 'user-2']);
    expect(api.getRoles()).toEqual(['role-3', 'role-4']);
    expect(usedMethods).toEqual(['getUsers', 'getRoles']);
  });

  test('if instance is wrapped with Proxy when it is one of dependencies of target type', () => {
    class Api {
      getUsers() {
        return ['user-1', 'user-2'];
      }
      getRoles() {
        return ['role-3', 'role-4'];
      }
    }

    class Service {
      constructor(public api: Api) {}
    }

    const usedMethods: string[] = [];

    container.registerImplementation(Api).enrich((api) => {
      return new Proxy(api, {
        get(instance, propertyName, receiver) {
          usedMethods.push(propertyName.toString());
          return instance[propertyName as keyof typeof instance];
        },
      });
    });
    const service = container.resolve(Service)!;

    expect(service.api.getUsers()).toEqual(['user-1', 'user-2']);
    expect(service.api.getRoles()).toEqual(['role-3', 'role-4']);
    expect(usedMethods).toEqual(['getUsers', 'getRoles']);
  });

  test('if instance is wrapped with Proxy when it is one of deep dependencies of target type', () => {
    class Api {
      getUsers() {
        return ['user-1', 'user-2'];
      }
      getRoles() {
        return ['role-3', 'role-4'];
      }
    }

    class Repository {
      constructor(public api: Api) {}
    }

    class Service {
      constructor(public repository: Repository) {}
    }

    const usedMethods: string[] = [];

    container.registerImplementation(Api).enrich((api) => {
      return new Proxy(api, {
        get(instance, propertyName, receiver) {
          usedMethods.push(propertyName.toString());
          return instance[propertyName as keyof typeof instance];
        },
      });
    });
    const service = container.resolve(Service)!;

    expect(service.repository.api.getUsers()).toEqual(['user-1', 'user-2']);
    expect(service.repository.api.getRoles()).toEqual(['role-3', 'role-4']);
    expect(usedMethods).toEqual(['getUsers', 'getRoles']);
  });
});
