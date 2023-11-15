import { InheritancePreserver } from './InheritancePreserver.js';
import { Constructor, ImplementationType } from './types.js';
import { workWithDiSettings } from './workWithDiSettings.js';

export function modifyConstructor<TClass>(
  constructor: Constructor<TClass>,
  modification: (settings: NonNullable<ImplementationType<TClass>>) => void
) {
  workWithDiSettings(constructor, modification);
  InheritancePreserver.constructorModified(constructor);
}
