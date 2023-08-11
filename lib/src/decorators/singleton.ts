import { InheritancePreserver } from './InheritancePreserver';
import { cheapDiSymbol } from '../cheapDiSymbol';
import { Constructor, ImplementationType } from '../types';

export function singleton<TClass extends Constructor>(constructor: TClass): TClass {
  modifySingleton(constructor);
  return constructor;
}

export function modifySingleton<TClass extends Constructor>(constructor: TClass) {
  const implementationType = constructor as unknown as ImplementationType<TClass>;

  if (!implementationType[cheapDiSymbol]) {
    implementationType[cheapDiSymbol] = {};
  }
  implementationType[cheapDiSymbol]!.singleton = true;

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
  return implementationType[cheapDiSymbol]?.singleton === true;
}
