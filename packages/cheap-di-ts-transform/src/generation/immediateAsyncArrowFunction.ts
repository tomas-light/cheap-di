import ts from 'typescript';
import { immediateFunction } from './immediateFunction.js';
import { arrowFunction } from './arrowFunction.js';

/**
 * @example
 * (async () => {
 *   // ...
 * })();
 * */
export function immediateAsyncArrowFunction(functionBodyStatements: ts.Statement[]) {
  return immediateFunction(arrowFunction(functionBodyStatements, true));
}
