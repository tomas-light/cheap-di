import { findMetadata } from './findMetadata.js';
import { Constructor, ImplementationType } from './types.js';

export function isSingleton<TClass extends Constructor>(constructor: TClass): boolean {
  const modifiedConstructor = findMetadata(constructor as ImplementationType<any>)?.modifiedClass;
  if (!modifiedConstructor) {
    return false;
  }
  if (modifiedConstructor !== constructor) {
    return false;
  }

  const implementationType = constructor as unknown as ImplementationType<TClass>;
  return findMetadata(implementationType)?.singleton === true;
}
