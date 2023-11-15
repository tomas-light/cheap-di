import { findOrCreateMetadata } from './findMetadata.js';
import { Constructor, ImplementationType } from './types.js';

export function workWithDiSettings<TClass>(
  constructor: Constructor<TClass>,
  modification: (settings: NonNullable<ImplementationType<TClass>>) => void
) {
  const implementationType = constructor as unknown as ImplementationType<TClass>;

  findOrCreateMetadata(implementationType);

  modification(implementationType);
}
