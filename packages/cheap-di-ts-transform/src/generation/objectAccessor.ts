import ts from 'typescript';

/**
 * generates object property accessing expression
 * @example
 * <object>.<property>
 * */
export function objectAccessor(objectName: string) {
  return {
    property: (propertyName: string) => {
      return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(objectName),
        ts.factory.createIdentifier(propertyName)
      );
    },
  };
}
