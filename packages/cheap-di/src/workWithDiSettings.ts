import { findOrCreateMetadata } from './findMetadata.js';
import { Dependency, ImplementationType } from './types.js';

export function workWithDiSettings<T, TClass extends Dependency<T>>(
  constructor: TClass,
  modification: (settings: NonNullable<ImplementationType<TClass>>) => void
) {
  const implementationType = constructor as unknown as ImplementationType<TClass>;

  findOrCreateMetadata(implementationType);

  modification(implementationType);
}
