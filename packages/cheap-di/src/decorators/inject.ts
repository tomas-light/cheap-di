import { saveConstructorMetadata } from '../metadata.js';
import { Dependency, ImplementationType, SomeDependency } from '../types.js';

export interface InjectDecorator {
  <T, TClass extends Dependency<T>>(
    ...dependencies: SomeDependency[]
  ): (constructor: TClass, context?: ClassDecoratorContext) => TClass;
}

export const inject: InjectDecorator = ((...dependencies) => {
  return (constructor) => {
    saveConstructorMetadata(constructor as ImplementationType<unknown>, ...dependencies);
    return constructor;
  };
}) as InjectDecorator;
