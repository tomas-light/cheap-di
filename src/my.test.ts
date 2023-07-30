import { dependenciesSymbolCheapDI } from './symbols';

test('new decorator', () => {
  class TestClass {
    props?: string;
  }

  class MyTest {
    constructor(private test: TestClass) {}
  }

  // (((MyTest[Symbol.metadata] ??= {})[dependenciesSymbolCheapDI] ??= []) as any[]).push('unknown', TestClass);
  const r = MyTest[Symbol.metadata]?.[dependenciesSymbolCheapDI];
  // expect(MyTest[Symbol.metadata]?.[dependenciesSymbolCheapDI]).toEqual(['unknown', TestClass]);
  expect(MyTest[Symbol.metadata]?.[dependenciesSymbolCheapDI]).toEqual([TestClass]);
});
