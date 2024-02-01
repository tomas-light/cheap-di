import ts from 'typescript';

// todo: is this correct assumption?
// identifier has its own position in code,
// so we should create new identifier with the same text to use in generated code
export function createIdentifierOfIdentifier(typeChecker: ts.TypeChecker, identifier: ts.Identifier) {
  try {
    const idSymbol = typeChecker.getSymbolAtLocation(identifier);
    if (idSymbol) {
      return ts.factory.createIdentifier(idSymbol.getName());
    }
  } catch {}

  return ts.factory.createIdentifier(identifier.text);
}
