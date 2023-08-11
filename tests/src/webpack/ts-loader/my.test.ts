import { cheapDiSymbol } from '@cheap-di/lib';

test('new decorator', () => {
  class TestClass {
    props?: string;
  }

  class MyTest {
    constructor(private test: TestClass) {}
  }

  // (((MyTest[Symbol.metadata] ??= {})[cheapDiSymbol] ??= []) as any[]).push('unknown', TestClass);
  const r = MyTest[Symbol.metadata]?.[cheapDiSymbol];
  // expect(MyTest[Symbol.metadata]?.[cheapDiSymbol]).toEqual(['unknown', TestClass]);
  expect(MyTest[Symbol.metadata]?.[cheapDiSymbol]).toEqual([TestClass]);
});
