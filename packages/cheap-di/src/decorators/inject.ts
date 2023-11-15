import { findOrCreateMetadata } from '../findMetadata.js';
import { Constructor, SomeDependency } from '../types.js';
import { workWithDiSettings } from '../workWithDiSettings.js';

export function inject<TClass extends Constructor>(...dependencies: SomeDependency[]) {
  return (constructor: TClass, context?: ClassDecoratorContext): TClass => {
    workWithDiSettings(constructor, (settings) => {
      const metadata = findOrCreateMetadata(settings);
      metadata.modifiedClass = constructor;
      metadata.dependencies = dependencies;
    });

    return constructor;
  };
}
