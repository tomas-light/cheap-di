import { findMetadata, findOrCreateMetadata } from '../findMetadata';
import { Constructor, ImplementationType } from '../types';
import { workWithDiSettings } from '../workWithDiSettings';

export class InheritancePreserver {
  static constructorModified(constructor: Constructor) {
    workWithDiSettings(constructor, (settings) => {
      const metadata = findOrCreateMetadata(settings);
      metadata.modifiedClass = constructor;
    });
  }

  static getModifiedConstructor(constructor: Constructor) {
    return findMetadata(constructor as ImplementationType<any>)?.modifiedClass;
  }
}
