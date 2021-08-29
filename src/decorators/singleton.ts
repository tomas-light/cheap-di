import { di } from './di';
import { InheritancePreserver } from './InheritancePreserver';
import { singletonSymbol as singleton_s } from '../symbols';
import { Constructor, ImplementationType } from '../types';

function singleton<TClass extends Constructor>(constructor: TClass): TClass {
  di(constructor);
  modifySingleton(constructor);

  return constructor;
}

function modifySingleton<TClass extends Constructor>(constructor: TClass) {
  (constructor as any)[singleton_s] = true;
  InheritancePreserver.constructorModified(constructor);
}

function isSingleton<TClass extends Constructor>(constructor: TClass): boolean {
  const modifiedConstructor = InheritancePreserver.getModifiedConstructor(constructor);
  return !!modifiedConstructor
    && modifiedConstructor === constructor
    && (constructor as ImplementationType<TClass>)[singleton_s] === true
  ;
}

export { singleton, modifySingleton, isSingleton };
