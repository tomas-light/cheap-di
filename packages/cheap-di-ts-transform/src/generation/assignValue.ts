import ts from 'typescript';

/**
 * generates assignment expression
 * @example
 * <left-operand> = <value>;
 * */
export function assignValue(leftOperand: ts.Expression) {
  return {
    value: (value: ts.Expression) => {
      return ts.factory.createExpressionStatement(
        ts.factory.createBinaryExpression(leftOperand, ts.factory.createToken(ts.SyntaxKind.FirstAssignment), value)
      );
    },
  };
}
