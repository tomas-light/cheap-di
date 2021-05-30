import { Dependency } from './types';

type D<T> = Dependency<T>;
type Return<TClass> = (constructor: TClass) => TClass;

function dependencies<A1, TClass extends new(a1: A1, ...args: any[]) => any>(a1: D<A1>): Return<TClass>;
function dependencies<A1, A2, TClass extends new(a1: A1, a2: A2, ...args: any[]) => any>(a1: D<A1>, a2: D<A2>,): Return<TClass>;
function dependencies<A1, A2, A3, TClass extends new(a1: A1, a2: A2, a3: A3, ...args: any[]) => any>(a1: D<A1>, a2: D<A2>, a3: D<A3>,): Return<TClass>;
function dependencies<A1, A2, A3, A4, TClass extends new(a1: A1, a2: A2, a3: A3, a4: A4, ...args: any[]) => any>(a1: D<A1>, a2: D<A2>, a3: D<A3>, a4: D<A4>,): Return<TClass>;
function dependencies<A1, A2, A3, A4, A5, TClass extends new(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, ...args: any[]) => any>(a1: D<A1>, a2: D<A2>, a3: D<A3>, a4: D<A4>, a5: D<A5>,): Return<TClass>;
function dependencies<A1, A2, A3, A4, A5, A6, TClass extends new(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, ...args: any[]) => any>(a1: D<A1>, a2: D<A2>, a3: D<A3>, a4: D<A4>, a5: D<A5>, a6: D<A6>,): Return<TClass>;
function dependencies<A1, A2, A3, A4, A5, A6, A7, TClass extends new(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, ...args: any[]) => any>(a1: D<A1>, a2: D<A2>, a3: D<A3>, a4: D<A4>, a5: D<A5>, a6: D<A6>, a7: D<A7>,): Return<TClass>;
function dependencies<A1, A2, A3, A4, A5, A6, A7, A8, TClass extends new(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8, ...args: any[]) => any>(a1: D<A1>, a2: D<A2>, a3: D<A3>, a4: D<A4>, a5: D<A5>, a6: D<A6>, a7: D<A7>, a8: D<A8>,): Return<TClass>;
function dependencies<A1, A2, A3, A4, A5, A6, A7, A8, A9, TClass extends new(a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8, a9: A9, ...args: any[]) => any>(a1: D<A1>, a2: D<A2>, a3: D<A3>, a4: D<A4>, a5: D<A5>, a6: D<A6>, a7: D<A7>, a8: D<A8>, a9: D<A9>,): Return<TClass>;
function dependencies<A1,
  A2,
  A3,
  A4,
  A5,
  A6,
  A7,
  A8,
  A9,
  A10,
  TClass extends new(
    a1: A1,
    a2: A2,
    a3: A3,
    a4: A4,
    a5: A5,
    a6: A6,
    a7: A7,
    a8: A8,
    a9: A9,
    a10: A10,
    ...args: any[]
  ) => any>(
  a1: D<A1>,
  a2: D<A2>,
  a3: D<A3>,
  a4: D<A4>,
  a5: D<A5>,
  a6: D<A6>,
  a7: D<A7>,
  a8: D<A8>,
  a9: D<A9>,
  a10: D<A10>,
): Return<TClass>;

function dependencies<TClass extends new(...args: any[]) => any>(...dependencies: any[]) {
  return (constructor: TClass): TClass => class extends constructor {
    static __dependencies: Dependency[] = dependencies || [];
  };
}

export { dependencies };
