import { findMetadata, findOrCreateMetadata } from './findMetadata.js';
import { Constructor, ImplementationType } from './types.js';
import { InheritancePreserver } from './InheritancePreserver.js';

export function singleton<TClass extends Constructor>(constructor: TClass, context?: ClassDecoratorContext): TClass {
  modifySingleton(constructor);
  return constructor;
}

export function modifySingleton<TClass extends Constructor>(constructor: TClass) {
  const implementationType = constructor as unknown as ImplementationType<TClass>;

  const metadata = findOrCreateMetadata(implementationType);
  metadata.singleton = true;

  InheritancePreserver.constructorModified(constructor);
}

export function isSingleton<TClass extends Constructor>(constructor: TClass): boolean {
  const modifiedConstructor = InheritancePreserver.getModifiedConstructor(constructor);
  if (!modifiedConstructor) {
    return false;
  }
  if (modifiedConstructor !== constructor) {
    return false;
  }

  const implementationType = constructor as unknown as ImplementationType<TClass>;
  return findMetadata(implementationType)?.singleton === true;
}
