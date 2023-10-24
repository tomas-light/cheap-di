import { findOrCreateMetadata } from './findMetadata';
import { Constructor, ImplementationType } from './types';

export function workWithDiSettings<TClass>(
  constructor: Constructor<TClass>,
  modification: (settings: NonNullable<ImplementationType<TClass>>) => void
) {
  const implementationType = constructor as unknown as ImplementationType<TClass>;

  findOrCreateMetadata(implementationType);

  modification(implementationType);
}
