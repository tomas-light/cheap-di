import { container } from 'cheap-di';
import { beforeEach, describe, expect, test } from 'vitest';

beforeEach(() => {
  container.clear();
});

describe('register implementation', () => {
  test('simple', () => {
    class Service {
      get(): string {
        return 'some';
      }
    }

    container.registerImplementation(Service);
    const service = container.resolve(Service)!;

    expect(service instanceof Service).toBe(true);
    expect(service.get()).toBe('some');
  });

  test('simple with passed arguments', () => {
    class Service {
      private readonly message: string;

      constructor(message: string) {
        this.message = message;
      }

      get() {
        return this.message;
      }
    }

    container.registerImplementation(Service);
    const service = container.resolve(Service, 'some message')!;

    expect(service instanceof Service).toBe(true);
    expect(service.get()).toBe('some message');
  });
});
