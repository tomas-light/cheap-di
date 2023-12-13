import { findMetadata } from './findMetadata.js';
import { Dependency, ImplementationType } from './types.js';
import { workWithDiSettings } from './workWithDiSettings.js';

export function modifyConstructor<T, TClass extends Dependency<T>>(
  constructor: TClass,
  modification: (settings: NonNullable<ImplementationType<TClass>>) => void
) {
  workWithDiSettings(constructor, (settings) => {
    const metadata = findMetadata(settings)!;
    metadata.modifiedClass = constructor;

    modification(settings);
  });
}
