import { callFunctionExpression } from './callFunction.js';
import ts from 'typescript';

/**
 * @example
 * require('<imported from>')
 * */
export function requireImport(importedFrom: string) {
  return callFunctionExpression('require', ts.factory.createStringLiteral(importedFrom));
}
