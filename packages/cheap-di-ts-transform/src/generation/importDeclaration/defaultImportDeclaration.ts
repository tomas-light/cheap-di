import ts from 'typescript';

/**
 * generates default import declaration with passed package
 * @example
 * import packageName from 'package-name';
 * */
export function defaultImportDeclaration(packageName: string, importedName = packageName) {
  let wasDash = false;

  const snake_case = importedName.split('').reduce((name, char) => {
    if (char === '-') {
      wasDash = true;
      return name;
    }
    if (wasDash) {
      wasDash = false;
      return name + '_' + char.toUpperCase();
    }
    return name + char;
  }, '');

  const importDeclarationNode = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier(snake_case), undefined),
    ts.factory.createStringLiteral(packageName)
  );

  return {
    identifier: ts.factory.createIdentifier(snake_case),
    importDeclarationNode,
  };
}
