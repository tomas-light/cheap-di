export * from './cheapDiSymbol.js';
export * from './CircularDependencyError.js';
export * from './ContainerImpl.js';
export * from './decorators/inject.js';
export * from './metadata.js';
export * from './isSingleton.js';
export * from './Trace.js';
export * from './types.js';

import { cheapDiSymbol } from './cheapDiSymbol.js';
import { CircularDependencyError } from './CircularDependencyError.js';
import { container, ContainerImpl } from './ContainerImpl.js';
import { inject } from './decorators/inject.js';
import {
  findMetadata,
  findOrCreateMetadata,
  saveConstructorMetadata,
  createConstructorMetadata,
} from './metadata.js';
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
  saveConstructorMetadata,
  createConstructorMetadata,
  isSingleton,
  Trace,
};
