import { dependenciesSymbol } from '../symbols';
import { ImplementationTypeWithInjection } from '../types';
import { di } from './di';

test('', () => {
  class Service {
    property: string = '2';
  }

  interface ICar {
    color: string;
  }

  @di
  class Test {
    constructor(car: ICar, service: Service) {
    }
  }

  expect((Test as ImplementationTypeWithInjection<any>)[dependenciesSymbol]).toEqual([undefined, Service]);
});
