import ts from 'typescript';

/**
 * generates constant statement with passed name and value
 * @example
 * const your_variable = <your-value>;
 * */
export function constVariable(variableName: string, initializer?: ts.Expression | undefined) {
  return ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(variableName),
          undefined,
          undefined,
          initializer
        ),
      ],
      ts.NodeFlags.Const
    )
  );
}
