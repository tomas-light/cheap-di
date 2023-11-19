import { container } from 'cheap-di';

beforeEach(() => {
  container.clear();
});

test('if parameter is optional', () => {
  class Some {
    get() {
      return '123';
    }
  }

  class Service {
    constructor(public readonly some?: Some) {}
  }

  const service = container.resolve(Service);
  expect(service?.some?.get()).toBe('123');
});

test('if parameter can be null', () => {
  class Some {
    get() {
      return '123';
    }
  }

  class Service {
    constructor(public readonly some: Some | null) {}
  }

  const service = container.resolve(Service);
  expect(service?.some?.get()).toBe('123');
});

test('if parameter can be undefined', () => {
  class Some {
    get() {
      return '123';
    }
  }

  class Service {
    constructor(public readonly some: Some | undefined) {}
  }

  const service = container.resolve(Service);
  expect(service?.some?.get()).toBe('123');
});

test('if parameter is optional and can be null or undefined', () => {
  class Some {
    get() {
      return '123';
    }
  }

  class Service {
    constructor(public readonly some?: Some | null | undefined) {}
  }

  const service = container.resolve(Service);
  expect(service?.some?.get()).toBe('123');
});
