import { cheapDiSymbol } from './cheapDiSymbol.js';
import { DiMetadata, ImplementationType, SomeDependency } from './types.js';

export function saveConstructorMetadata<TClass>(
  constructor: ImplementationType<TClass>,
  ...dependencies: SomeDependency[]
) {
  const metadata = findOrCreateMetadata(constructor);
  metadata.dependencies = dependencies;

  return metadata;
}

export function findOrCreateMetadata<TClass>(constructor: ImplementationType<TClass>) {
  const metadata = findMetadata(constructor);
  if (metadata) {
    return metadata;
  }

  return createConstructorMetadata(constructor);
}

export function findMetadata<TClass>(constructor: ImplementationType<TClass>) {
  return constructor[cheapDiSymbol];
}

export function createConstructorMetadata<TClass>(constructor: ImplementationType<TClass>): DiMetadata {
  if (!constructor) {
    return {};
  }
  return (constructor[cheapDiSymbol] = {
    modifiedClass: constructor,
  });
}
