export * from './cheapDiSymbol.js';
export * from './CircularDependencyError.js';
export * from './ContainerImpl.js';
export * from './decorators/inject.js';
export * from './findMetadata.js';
export * from './isSingleton.js';
export * from './Trace.js';
export * from './types.js';

import { cheapDiSymbol } from './cheapDiSymbol.js';
import { CircularDependencyError } from './CircularDependencyError.js';
import { container, ContainerImpl } from './ContainerImpl.js';
import { inject } from './decorators/inject.js';
import { findMetadata, findOrCreateMetadata } from './findMetadata.js';
import { isSingleton } from './isSingleton.js';
import { Trace } from './Trace.js';

export default {
  cheapDiSymbol,
  CircularDependencyError,
  container,
  ContainerImpl,
  inject,
  findMetadata,
  findOrCreateMetadata,
  isSingleton,
  Trace,
};

// typescript polyfill
declare global {
  interface SymbolConstructor {
    readonly metadata: unique symbol;
  }

  interface Function {
    [Symbol.metadata]: DecoratorMetadata | null;
  }
}

type Writable<T> = {
  -readonly [key in keyof T]: T[key];
};

// runtime polyfill
if (Symbol.metadata == null) {
  (Symbol as Writable<typeof Symbol>).metadata = Symbol('cheap-di Symbol.metadata polyfill') as typeof Symbol.metadata;
}
