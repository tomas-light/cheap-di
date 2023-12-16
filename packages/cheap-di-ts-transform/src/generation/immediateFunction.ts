import ts from 'typescript';

/**
 * @example
 * (<your function>)();
 * */
export function immediateFunction(functionExpression: ts.Expression) {
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(ts.factory.createParenthesizedExpression(functionExpression), undefined, undefined)
  );
}
