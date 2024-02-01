import ts from 'typescript';
import { ImportedClass } from './ClassConstructorParameter.js';
import { findImports } from './findImports.js';
import { isThereClassInDeclarations } from './isThereClassInDeclarations.js';

export function findImportedClass(parameters: {
  typeChecker: ts.TypeChecker;
  tsReferenceNode: ts.TypeReferenceNode;

  identifier: ts.Identifier;
  identifierSymbol: ts.Symbol;

  // myPackage.Foo => namespaceIdentifier === myPackage / identifier === Foo
  namespaceIdentifier?: ts.Identifier;
  namespaceIdentifierSymbol?: ts.Symbol;
}): ImportedClass | undefined {
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

    if (_import.namedAsClassId && _import.importType === 'named') {
      _symbol = typeChecker.getSymbolAtLocation(_import.namedAsClassId);
    } else {
      _symbol = typeChecker.getSymbolAtLocation(_import.classId);
    }

    if (namespaceIdentifierSymbol) {
      return _symbol === namespaceIdentifierSymbol;
    }

    return _symbol === identifierSymbol;
  });

  if (!importedType) {
    const classDeclaration = isThereClassInDeclarations(symbolDeclarations);
    if (classDeclaration) {
      return {
        classId: identifier,
        namedAsClassId: undefined,
        importedFrom: '',
        importType: 'local defined',
      };
    }
    return undefined;
  }

  if (namespaceIdentifierSymbol) {
    // because founded import contains only namespace id, but we expect class id
    return {
      ...importedType,
      classId: identifier,
    };
  }

  return importedType;
}
