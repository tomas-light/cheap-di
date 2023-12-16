import { cheapDiSymbol } from './cheapDiSymbol.js';
import { AbstractConstructor, Constructor, DiMetadata, ImplementationType, SomeDependency } from './types.js';

export function saveConstructorMetadata<T>(
  constructor: Constructor<T> | AbstractConstructor<T>,
  ...dependencies: SomeDependency[]
) {
  if (!constructor) {
    return {};
  }

  const metadata = createConstructorMetadata(constructor as ImplementationType<T>);
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
  return (constructor[cheapDiSymbol] = {
    modifiedClass: constructor,
  });
}
