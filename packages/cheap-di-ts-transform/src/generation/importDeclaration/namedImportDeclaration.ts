import ts from 'typescript';
import { ImportName } from './importDeclaration.js';

/**
 * generates named import declaration with passed package and variables names
 * @example
 * import { your_variable1, variable2 as your_variable2 } from 'your-package-name';
 * */
export function namedImportDeclaration(packageName: string, names: ImportName[]) {
  const identifiers: ts.Identifier[] = [];

  const importDeclarationNode = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports(
        names.map(({ variableName, asAnotherName }) => {
          if (asAnotherName) {
            const variableIdentifier = ts.factory.createIdentifier(asAnotherName);
            identifiers.push(variableIdentifier);
            return ts.factory.createImportSpecifier(
              false,
              ts.factory.createIdentifier(asAnotherName),
              variableIdentifier
            );
          }

          const variableIdentifier = ts.factory.createIdentifier(variableName);
          identifiers.push(variableIdentifier);
          return ts.factory.createImportSpecifier(false, undefined, variableIdentifier);
        })
      )
    ),
    ts.factory.createStringLiteral(packageName)
  );

  return {
    identifiers,
    importDeclarationNode,
  };
}
