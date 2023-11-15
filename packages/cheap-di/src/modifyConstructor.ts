import { findOrCreateMetadata } from './findMetadata.js';
import { Constructor, ImplementationType } from './types.js';
import { workWithDiSettings } from './workWithDiSettings.js';

export function modifyConstructor<TClass>(
  constructor: Constructor<TClass>,
  modification: (settings: NonNullable<ImplementationType<TClass>>) => void
) {
  workWithDiSettings(constructor, (settings) => {
    const metadata = findOrCreateMetadata(settings);
    metadata.modifiedClass = constructor as TClass;

    modification(settings);
  });
}
