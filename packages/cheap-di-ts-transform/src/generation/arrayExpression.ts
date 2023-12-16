import ts from 'typescript';

/**
 * generates array statement
 * @example
 * [<variable1>, <variable2>]
 * */
export function arrayExpression(...values: ts.Expression[]) {
  return ts.factory.createArrayLiteralExpression(values, false);
}
