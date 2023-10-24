import { findMetadata, findOrCreateMetadata } from '../findMetadata';
import { Constructor, ImplementationType } from '../types';
import { InheritancePreserver } from './InheritancePreserver';

export function singleton<TClass extends Constructor>(constructor: TClass, context: ClassDecoratorContext): TClass {
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
