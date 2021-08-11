import { singleton } from './singleton';
import { singletonSymbol as singleton_s } from './symbols';
import { ImplementationType } from './types';

test('', () => {
  @singleton
  class MyClass {
  }

  expect((MyClass as ImplementationType<MyClass>)[singleton_s]).toEqual(true);
});
