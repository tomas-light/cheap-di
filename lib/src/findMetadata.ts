import { cheapDiSymbol } from './cheapDiSymbol';
import { DiMetadataStorage, ImplementationType } from './types';

export function findOrCreateMetadata<TClass>(settings: NonNullable<ImplementationType<TClass>>) {
  let metadataStorage = settings[Symbol.metadata] as DiMetadataStorage<TClass>;

  if (!metadataStorage) {
    metadataStorage = settings[Symbol.metadata] = {};
  }

  let metadata = metadataStorage[cheapDiSymbol];

  if (!metadata) {
    metadata = metadataStorage[cheapDiSymbol] = {};
  }

  return metadata;
}

export function findMetadata<TClass>(settings: NonNullable<ImplementationType<TClass>>) {
  const metadataStorage = settings[Symbol.metadata] as DiMetadataStorage<TClass>;
  if (!metadataStorage) {
    return;
  }

  const metadata = metadataStorage[cheapDiSymbol];
  if (!metadata) {
    return;
  }

  return metadata;
}
