import { findMetadata } from '../findMetadata.js';
import { Dependency, SomeDependency } from '../types.js';
import { workWithDiSettings } from '../workWithDiSettings.js';

export interface InjectDecorator {
  // stage 3 decorator
  <T, TClass extends Dependency<T>>(
    ...dependencies: SomeDependency[]
  ): (constructor: TClass, context: ClassDecoratorContext) => TClass;

  // stage 2 decorator
  <T, TClass extends Dependency<T>>(...dependencies: SomeDependency[]): (constructor: TClass) => TClass;
}

export const inject: InjectDecorator = ((...dependencies) => {
  return (constructor) => {
    workWithDiSettings(constructor, (settings) => {
      const metadata = findMetadata(settings)!;
      metadata.modifiedClass = constructor;
      metadata.injectDependencies = dependencies;
    });

    return constructor;
  };
}) as InjectDecorator;
