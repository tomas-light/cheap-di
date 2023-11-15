import ts from 'typescript';

/**
 * generates statement with function call
 * @example
 * yourFunctionName(parameter1, parameter2);
 * */
export function callFunction(functionName: string, ...functionParameters: ts.Expression[]) {
  return ts.factory.createCallExpression(ts.factory.createIdentifier(functionName), undefined, functionParameters);
}
