import { inject } from './inject';
import { dependenciesSymbol as dependencies_s } from './symbols';
import { ImplementationType } from './types';

test('', () => {
  class Service {
    a: number;

    constructor() {
      this.a = 1;
    }
  }

  class MyClass {
    constructor(
      @inject(Service) service: Service,
      @inject(Service) service2: Service,
    ) {
    }
  }

  expect((MyClass as ImplementationType<MyClass>)[dependencies_s]).toEqual([Service]);
});
