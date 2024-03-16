import ts from 'typescript';
import { makeIdentifier } from './makeIdentifier.js';
import { constVariableDeclaration } from './constVariableDeclaration.js';

/**
 * generates constant statement with passed name and value
 * @example
 * const { name1: another_name1, name2: another_name2 } = <your-value>;
 * */
export function constVariableWithAliasAndDestructor(
  variables: {
    name: string | ts.Identifier;
    aliasName: string | ts.Identifier;
  }[],
  initializer?: ts.Expression | undefined
) {
  const destructorBinding = ts.factory.createObjectBindingPattern(
    variables.map(({ name, aliasName }) =>
      ts.factory.createBindingElement(undefined, makeIdentifier(name), makeIdentifier(aliasName), undefined)
    )
  );

  return constVariableDeclaration(destructorBinding, initializer);
}
