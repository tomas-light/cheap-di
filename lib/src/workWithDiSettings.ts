import { Constructor, ImplementationType } from './types';
import { cheapDiSymbol } from './cheapDiSymbol';

export function workWithDiSettings<TClass>(
  constructor: Constructor<TClass>,
  modification: (settings: NonNullable<ImplementationType<TClass>>) => void
) {
  const implementationType = constructor as unknown as ImplementationType<TClass>;

  if (!implementationType[cheapDiSymbol]) {
    implementationType[cheapDiSymbol] = {};
  }

  modification(implementationType[cheapDiSymbol]!);
}
