import { findMetadata } from './metadata';
import { Dependency, ImplementationType } from './types';

export function isSingleton<T, TClass extends Dependency<T>>(constructor: TClass): boolean {
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
