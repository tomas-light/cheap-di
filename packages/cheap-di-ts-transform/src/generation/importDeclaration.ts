import ts from 'typescript';

/**
 * generates import declaration
 * */
export function importDeclaration(variableName?: string) {
  return {
    from: (packageName: string) => {
      if (variableName) {
        return namedImportDeclaration(packageName, variableName);
      } else {
        return defaultImportDeclaration(packageName);
      }
    },
  };
}

/**
 * generates default import declaration with passed package
 * @example
 * import packageName from 'packageName';
 * */
function defaultImportDeclaration(packageName: string) {
  let wasDash = false;

  const camelCasedNamed = packageName.split('').reduce((name, char) => {
    if (char === '-') {
      wasDash = true;
      return name;
    }
    if (wasDash) {
      wasDash = false;
      return name + char.toUpperCase();
    }
    return name + char;
  }, '');

  const packageIdentifier = ts.factory.createIdentifier(camelCasedNamed);

  const nodes = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, packageIdentifier, undefined),
    ts.factory.createStringLiteral(packageName)
  );

  return {
    identifier: packageIdentifier,
    nodes,
  };
}

/**
 * generates named import declaration with passed package and variables names
 * @example
 * import { your_variable1, your_variable2 } from 'your-package-name';
 * */
function namedImportDeclaration(packageName: string, variableName: string) {
  const variableIdentifier = ts.factory.createIdentifier(variableName);

  const nodes = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([ts.factory.createImportSpecifier(false, undefined, variableIdentifier)])
    ),
    ts.factory.createStringLiteral(packageName)
  );

  return {
    identifier: variableIdentifier,
    nodes,
  };
}
