import ts from 'typescript';
import { makeIdentifier } from './makeIdentifier.js';

/**
 * generates statement with function call
 * @example
 * yourFunctionName(parameter1, parameter2);
 * */
export function callFunction(
  funcOrNameOrIdentifier: string | ts.Identifier | ts.PropertyAccessExpression,
  ...functionParameters: ts.Expression[]
) {
  if (isPropertyAccessExpression(funcOrNameOrIdentifier)) {
    return ts.factory.createCallExpression(funcOrNameOrIdentifier, undefined, functionParameters);
  }

  const identifier = makeIdentifier(funcOrNameOrIdentifier);
  return ts.factory.createCallExpression(identifier, undefined, functionParameters);
}

function isPropertyAccessExpression(
  funcOrNameOrIdentifier: string | ts.Identifier | ts.PropertyAccessExpression
): funcOrNameOrIdentifier is ts.PropertyAccessExpression {
  return (
    typeof funcOrNameOrIdentifier === 'object' && funcOrNameOrIdentifier.kind === ts.SyntaxKind.PropertyAccessExpression
  );
}
