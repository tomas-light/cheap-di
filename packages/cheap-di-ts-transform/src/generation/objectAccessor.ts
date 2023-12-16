import ts from 'typescript';
import { makeIdentifier } from './makeIdentifier.js';

/**
 * generates object property accessing expression
 * @example
 * <object>.<property>
 * */
export function objectAccessor(objectNameOrIdentifier: string | ts.Identifier) {
  return {
    property: (propertyName: string) => {
      const identifier = makeIdentifier(objectNameOrIdentifier);
      return ts.factory.createPropertyAccessExpression(identifier, ts.factory.createIdentifier(propertyName));
    },
  };
}
