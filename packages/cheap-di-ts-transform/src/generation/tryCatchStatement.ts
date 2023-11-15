import ts from 'typescript';

/**
 * generates try-catch statement with passed body
 * @example
 * try {
 * // your body
 * } catch {}
 * */
export function tryCatchStatement(tryStatements: ts.Statement[]) {
  return ts.factory.createTryStatement(
    ts.factory.createBlock(tryStatements, true),
    ts.factory.createCatchClause(undefined, ts.factory.createBlock([], true)),
    undefined
  );
}
