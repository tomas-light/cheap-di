import { cheapDiSymbol } from '../cheapDiSymbol';
import { Constructor, ImplementationType } from '../types';
import { workWithDiSettings } from '../workWithDiSettings';

export class InheritancePreserver {
  static constructorModified(constructor: Constructor) {
    workWithDiSettings(constructor, (settings) => {
      settings.modifiedClass = constructor;
    });
  }

  static getModifiedConstructor(constructor: Constructor) {
    return (constructor as ImplementationType<any>)[cheapDiSymbol]?.modifiedClass;
  }
}
