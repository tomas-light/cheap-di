import ts from 'typescript';
import { constVariableDeclaration } from './constVariableDeclaration.js';
import { makeIdentifier } from './makeIdentifier.js';

/**
 * generates constant statement with passed name and value
 * @example
 * const { your_variable } = <your-value>;
 * */
export function constVariableWithDestructor(
  variableName: string | ts.Identifier,
  initializer?: ts.Expression | undefined
) {
  const identifier = makeIdentifier(variableName);

  const destructorBinding = ts.factory.createObjectBindingPattern([
    ts.factory.createBindingElement(undefined, undefined, identifier, undefined),
  ]);

  return constVariableDeclaration(destructorBinding, initializer);
}
