import ts from 'typescript';
import { ClassConstructorParameter, ImportedClass, LocalClass } from './ClassConstructorParameter.js';
import { findImports } from './findImports.js';
import { isThereClassInDeclarations } from './isThereClassInDeclarations.js';

export function findClassIdentifierSymbol(
  typeChecker: ts.TypeChecker,
  tsNode: ts.Node,
  findClassConstructorParameters: (
    classNode: ts.Node,
    constructorParameters?: ClassConstructorParameter[]
  ) => ClassConstructorParameter[] | undefined
): LocalClass | ImportedClass | undefined {
  let identifier: ts.Identifier | undefined;
  let identifierSymbol: ts.Symbol | undefined;

  for (const nodeChild of tsNode.getChildren()) {
    if (ts.isIdentifier(nodeChild)) {
      identifier = nodeChild;
      identifierSymbol = typeChecker.getSymbolAtLocation(nodeChild);
      break;
    }
  }

  if (!identifierSymbol) {
    return undefined;
  }

  const symbolDeclarations = identifierSymbol.getDeclarations();
  if (!symbolDeclarations?.length) {
    return undefined;
  }

  const isImport = symbolDeclarations.some(
    (declaration) =>
      ts.isImportSpecifier(declaration) || ts.isImportClause(declaration) || ts.isExternalModuleReference(declaration)
  );

  if (!isImport) {
    const classDeclaration = isThereClassInDeclarations(symbolDeclarations);
    if (classDeclaration) {
      return {
        localName: identifierSymbol.escapedName.toString(),
      };
    }
    return undefined;
  }

  const imports = findImports(tsNode.getSourceFile());

  const importedType = imports.find((_import) => {
    const _symbol = typeChecker.getSymbolAtLocation(_import.identifier);
    return _symbol === identifierSymbol;
  });
  if (!importedType) {
    return undefined;
  }
  if (!identifier) {
    return undefined;
  }

  const tsType = typeChecker.getTypeAtLocation(identifier);
  const typeDeclarations = (tsType.symbol ?? tsType.aliasSymbol)?.getDeclarations();

  const classDeclaration = isThereClassInDeclarations(typeDeclarations);
  if (classDeclaration) {
    return {
      importedFrom: importedType.nameFromWhereImportIs,
      classNameInImport: importedType.identifier.getFullText().trim(),
      importType: importedType.importType,
      constructorParameters: findClassConstructorParameters(classDeclaration),
    };
  }
  return undefined;
}
