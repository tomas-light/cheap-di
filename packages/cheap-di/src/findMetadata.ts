import { cheapDiSymbol } from './cheapDiSymbol.js';
import { ImplementationType } from './types.js';

export function findOrCreateMetadata<TClass>(settings: NonNullable<ImplementationType<TClass>>) {
  let metadata = settings[cheapDiSymbol];

  if (!metadata) {
    metadata = settings[cheapDiSymbol] = {};
  }

  return metadata;
}

export function findMetadata<TClass>(settings: NonNullable<ImplementationType<TClass>>) {
  return settings[cheapDiSymbol];
}
