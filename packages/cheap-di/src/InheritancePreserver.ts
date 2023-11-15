import { findMetadata, findOrCreateMetadata } from './findMetadata.js';
import { Constructor, ImplementationType } from './types.js';
import { workWithDiSettings } from './workWithDiSettings.js';

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
