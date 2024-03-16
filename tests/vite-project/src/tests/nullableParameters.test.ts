import { container } from 'cheap-di';
import { beforeEach, expect, test } from 'vitest';

beforeEach(() => {
  container.clear();
});

test('if parameter is optional', () => {
  class Some1 {
    get() {
      return '123';
    }
  }

  class Service1 {
    constructor(public readonly some?: Some1) {}
  }

  const service = container.resolve(Service1);
  expect(service?.some?.get()).toBe('123');
});

test('if parameter can be null', () => {
  class Some2 {
    get() {
      return '123';
    }
  }

  class Service2 {
    constructor(public readonly some: Some2 | null) {}
  }

  const service = container.resolve(Service2);
  expect(service?.some?.get()).toBe('123');
});

test('if parameter can be undefined', () => {
  class Some3 {
    get() {
      return '123';
    }
  }

  class Service3 {
    constructor(public readonly some: Some3 | undefined) {}
  }

  const service = container.resolve(Service3);
  expect(service?.some?.get()).toBe('123');
});

test('if parameter is optional and can be null or undefined', () => {
  class Some4 {
    get() {
      return '123';
    }
  }

  class Service4 {
    constructor(public readonly some?: Some4 | null | undefined) {}
  }

  const service = container.resolve(Service4);
  expect(service?.some?.get()).toBe('123');
});
