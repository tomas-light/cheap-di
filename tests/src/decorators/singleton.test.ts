import { singleton, isSingleton } from '@cheap-di/lib';

test('set singleton', () => {
  @singleton
  class MyClass {}

  expect(isSingleton(MyClass)).toEqual(true);
});

test('singleton is not inherited', () => {
  @singleton
  class MyClass {}

  class MyClass2 extends MyClass {}

  expect(isSingleton(MyClass)).toEqual(true);
  expect(isSingleton(MyClass2)).toEqual(false);
});
