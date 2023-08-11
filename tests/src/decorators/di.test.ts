import { dependenciesSymbol, ImplementationTypeWithInjection, di } from '@cheap-di/lib';

test('', () => {
  class Service {
    property: string = '2';
  }

  interface ICar {
    color: string;
  }

  @di
  class Test {
    constructor(car: ICar, service: Service) {}
  }

  expect((Test as ImplementationTypeWithInjection<any>)[dependenciesSymbol]).toEqual([undefined, Service]);
});
