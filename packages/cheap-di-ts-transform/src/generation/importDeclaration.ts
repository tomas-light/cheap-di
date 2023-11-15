import ts from 'typescript';

/**
 * generates import declaration with passed package and variables names
 * @example
 * import { your_variable1, your_variable2 } from 'your-package-name';
 * */
export function importDeclaration(...variableNames: string[]) {
  return {
    from: (packageName: string) => {
      return ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports(
            variableNames.map((variableName) =>
              ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(variableName))
            )
          )
        ),
        ts.factory.createStringLiteral(packageName)
      );
    },
  };
}
