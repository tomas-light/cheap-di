import { singleton } from './singleton';
import { ImplementationType } from './types';

test('', () => {
  @singleton()
  class MyClass {
  }

  expect((MyClass as ImplementationType<MyClass>).__singleton).toEqual(true);
});
