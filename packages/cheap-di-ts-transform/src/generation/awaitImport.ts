import ts from 'typescript';
import { callFunctionExpression } from './callFunction.js';

/**
 * @example
 * await import('<imported from>')
 * */
export function awaitImport(importedFrom: string) {
  return ts.factory.createAwaitExpression(
    callFunctionExpression('import', ts.factory.createStringLiteral(importedFrom))
  );
  // return ts.factory.createAwaitExpression(
  //   ts.factory.createCallExpression(
  //     //
  //     ts.factory.createToken(ts.SyntaxKind.ImportKeyword) as ts.Expression,
  //     undefined,
  //     [ts.factory.createStringLiteral(importedFrom)]
  //   )
  // );
}
