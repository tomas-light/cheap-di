import { saveConstructorMetadata } from '../metadata.js';
import { ImplementationType, SomeDependency } from '../types.js';

export interface InjectDecorator {
  <T>(...dependencies: SomeDependency[]): (constructor: T, context?: ClassDecoratorContext) => T;
}

export const inject: InjectDecorator = ((...dependencies) => {
  return (constructor) => {
    saveConstructorMetadata(constructor as ImplementationType<unknown>, ...dependencies);
    return constructor;
  };
}) as InjectDecorator;
