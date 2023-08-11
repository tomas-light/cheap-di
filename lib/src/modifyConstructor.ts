import { InheritancePreserver } from './decorators/InheritancePreserver';
import { Constructor, ImplementationType } from './types';
import { workWithDiSettings } from './workWithDiSettings';

export function modifyConstructor<TClass>(
  constructor: Constructor<TClass>,
  modification: (settings: NonNullable<ImplementationType<TClass>>) => void
) {
  workWithDiSettings(constructor, modification);
  InheritancePreserver.constructorModified(implementationType);
}
