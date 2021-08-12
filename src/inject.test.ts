import { inject } from './inject';
import { dependenciesSymbol } from './symbols';

test('', () => {
  class Service {
    a: number = 1;
  }
  class Service2 {
    b: number = 2;
  }

  class Test {
    constructor(@inject(Service) service?: Service) {}
  }
  class Test2 extends Test {
    constructor(@inject(Service2) service?: Service2) {
      super();
    }
  }

  expect((Test as any)[dependenciesSymbol]).toEqual([Service]);
  expect((Test2 as any)[dependenciesSymbol]).toEqual([Service2]);
});
