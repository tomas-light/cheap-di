import ts from 'typescript';

/**
 * @example
 * () => {
 *   // ...
 * }
 *
 * async () => {
 *   // ...
 * }
 * */
export function arrowFunction(functionBodyStatements: ts.Statement[], async: boolean = false) {
  const modifiers: ts.Modifier[] = [];
  if (async) {
    modifiers.push(ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword));
  }

  return ts.factory.createArrowFunction(
    modifiers,
    undefined,
    [],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createBlock(functionBodyStatements, true)
  );
}
