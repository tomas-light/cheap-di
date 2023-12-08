import { findOrCreateMetadata } from '../findMetadata.js';
import { Constructor, SomeDependency } from '../types.js';
import { workWithDiSettings } from '../workWithDiSettings.js';

export interface InjectDecorator {
  // stage 3 decorator
  <TClass extends Constructor>(
    ...dependencies: SomeDependency[]
  ): (constructor: TClass, context: ClassDecoratorContext) => TClass;

  // stage 2 decorator
  <TClass extends Constructor>(...dependencies: SomeDependency[]): (constructor: TClass) => TClass;
}

export const inject: InjectDecorator = ((...dependencies) => {
  return (constructor) => {
    workWithDiSettings(constructor, (settings) => {
      const metadata = findOrCreateMetadata(settings);
      metadata.modifiedClass = constructor;
      metadata.dependencies = dependencies;
    });

    return constructor;
  };
}) as InjectDecorator;
