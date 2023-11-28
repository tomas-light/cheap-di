import ts from 'typescript';
import { constVariableDeclaration } from './constVariableDeclaration.js';
import { makeIdentifier } from './makeIdentifier.js';

/**
 * generates constant statement with passed name and value
 * @example
 * const your_variable = <your-value>;
 * */
export function constVariable(variableName: string | ts.Identifier, initializer?: ts.Expression | undefined) {
  const identifier = makeIdentifier(variableName);
  return constVariableDeclaration(identifier, initializer);
}
