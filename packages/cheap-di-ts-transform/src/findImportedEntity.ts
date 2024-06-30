import ts from 'typescript';
import { ImportedEntity } from './ClassConstructorParameter.js';
import { findImports } from './findImports.js';
import { isThereClassInDeclarations } from './isThereClassInDeclarations.js';

export function findImportedEntity(parameters: {
  typeChecker: ts.TypeChecker;
  tsReferenceNode: ts.TypeReferenceNode;

  identifier: ts.Identifier;
  identifierSymbol: ts.Symbol;

  // myPackage.Foo => namespaceIdentifier === myPackage / identifier === Foo
  namespaceIdentifier?: ts.Identifier;
  namespaceIdentifierSymbol?: ts.Symbol;
}): (ImportedEntity & { isClass: boolean }) | undefined {
  const { typeChecker, tsReferenceNode, identifier, identifierSymbol, namespaceIdentifier, namespaceIdentifierSymbol } =
    parameters;

  const nodeText = tsReferenceNode.getFullText();

  const symbolDeclarations = identifierSymbol.getDeclarations();
  if (!symbolDeclarations?.length) {
    return undefined;
  }

  const imports = findImports(tsReferenceNode.getSourceFile());
  const importedType = imports.find((_import) => {
    let _symbol: ts.Symbol | undefined;

    if (_import.namedAsId && _import.importType === 'named') {
      _symbol = typeChecker.getSymbolAtLocation(_import.namedAsId);
    } else {
      _symbol = typeChecker.getSymbolAtLocation(_import.id);
    }

    if (namespaceIdentifierSymbol) {
      return _symbol === namespaceIdentifierSymbol;
    }

    return _symbol === identifierSymbol;
  });

  if (!importedType) {
    // local defined class
    const classDeclaration = isThereClassInDeclarations(symbolDeclarations);
    if (classDeclaration) {
      return {
        id: identifier,
        namedAsId: undefined,
        importedFrom: '',
        importType: 'local defined',
        isClass: true,
      };
    }
    return undefined;
  }

  const tsType = typeChecker.getTypeAtLocation(identifier);
  const typeDeclarations = (tsType.symbol ?? tsType.aliasSymbol)?.getDeclarations();

  const classDeclaration = isThereClassInDeclarations(typeDeclarations);
  if (!classDeclaration) {
    return { ...importedType, isClass: false };
  }

  if (namespaceIdentifierSymbol) {
    // because founded import contains only namespace id, but we expect class id
    return {
      ...importedType,
      id: identifier,
      isClass: true,
    };
  }

  return { ...importedType, isClass: true };
}
