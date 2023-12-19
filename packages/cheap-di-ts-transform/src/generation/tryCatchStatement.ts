import ts from 'typescript';
import { objectAccessor } from './objectAccessor.js';
import { InternalTransformOptions } from '../InternalTransformOptions.js';

/**
 * generates try-catch statement with passed body
 * @example
 * try {
 * // your body
 * } catch (error: unknown) {
 *   console.warn(error);
 * }
 * */
export function tryCatchStatement(tryStatements: ts.Statement[], transformOptions: InternalTransformOptions) {
  const errorId = ts.factory.createIdentifier('error');

  return ts.factory.createTryStatement(
    ts.factory.createBlock(tryStatements, true),

    // catch (error: unknown) {
    //   console.warn(error);
    // }
    ts.factory.createCatchClause(
      // error: unknown
      ts.factory.createVariableDeclaration(
        errorId,
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
      ),

      ts.factory.createBlock(
        [
          // console.warn(error);
          ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
              // console.warn
              objectAccessor('console').property(transformOptions.errorsLogLevel),
              undefined,

              // error
              [errorId]
            )
          ),
        ],
        true
      )
    ),
    undefined
  );
  // return ts.factory.createTryStatement(
  //   ts.factory.createBlock(tryStatements, true),
  //   ts.factory.createCatchClause(undefined, ts.factory.createBlock([], true)),
  //   undefined
  // );
}
