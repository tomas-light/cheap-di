import ts from 'typescript';
import { makeIdentifier } from './makeIdentifier.js';

/**
 * generates constant statement with passed name and value
 * @example
 * const your_variable = <your-value>;
 * */
export function constVariable(variableName: string | ts.Identifier, initializer?: ts.Expression | undefined) {
  const identifier = makeIdentifier(variableName);

  return ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [ts.factory.createVariableDeclaration(identifier, undefined, undefined, initializer)],
      ts.NodeFlags.Const
    )
  );
}
