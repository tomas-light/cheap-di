import { inheritancePreserveSymbol } from '../symbols';
import { Constructor, ImplementationType } from '../types';

class InheritancePreserver {
  static constructorModified(constructor: Constructor) {
    (constructor as ImplementationType<any>)[inheritancePreserveSymbol] = constructor;
  }

  static getModifiedConstructor(constructor: Constructor) {
    return (constructor as ImplementationType<any>)[inheritancePreserveSymbol];
  }
}

export { InheritancePreserver };
