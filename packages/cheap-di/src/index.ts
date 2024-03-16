export * from './cheapDiSymbol';
export * from './CircularDependencyError';
export * from './ContainerImpl';
export * from './decorators/inject';
export * from './metadata';
export * from './isSingleton';
export * from './Trace';
export * from './types';

import { cheapDiSymbol } from './cheapDiSymbol';
import { CircularDependencyError } from './CircularDependencyError';
import { container, ContainerImpl } from './ContainerImpl';
import { inject } from './decorators/inject';
import { findMetadata, findOrCreateMetadata, saveConstructorMetadata, createConstructorMetadata } from './metadata';
import { isSingleton } from './isSingleton';
import { Trace } from './Trace';

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
