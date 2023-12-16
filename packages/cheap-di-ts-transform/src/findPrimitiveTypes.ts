import ts from 'typescript';
import { PrimitiveParameter, PrimitiveType } from './ClassConstructorParameter.js';

export function findPrimitiveTypes(tsNode: ts.Node): PrimitiveParameter['primitiveTypes'] {
  const debugName = tsNode.getFullText();

  const nodePrimitive = getPrimitiveTypeOfTsNode(tsNode);
  if (nodePrimitive) {
    return [nodePrimitive];
  }

  const primitiveTypes: PrimitiveParameter['primitiveTypes'] = [];

  tsNode.forEachChild((childNode) => {
    const debugName = childNode.getFullText();

    const primitive = getPrimitiveTypeOfTsNode(childNode);
    if (primitive) {
      primitiveTypes.push(primitive);
    }
  });

  return primitiveTypes;
}

function getPrimitiveTypeOfTsNode(tsNode: ts.Node): PrimitiveType | undefined {
  switch (tsNode.kind) {
    case ts.SyntaxKind.NumberKeyword:
    case ts.SyntaxKind.NumericLiteral:
      return 'number';

    case ts.SyntaxKind.BooleanKeyword:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
      return 'boolean';

    case ts.SyntaxKind.StringKeyword:
    case ts.SyntaxKind.StringLiteral:
      return 'string';

    case ts.SyntaxKind.UndefinedKeyword:
      return 'undefined';

    case ts.SyntaxKind.SymbolKeyword:
      return 'symbol';

    case ts.SyntaxKind.BigIntKeyword:
    case ts.SyntaxKind.BigIntLiteral:
      return 'bigint';

    case ts.SyntaxKind.AnyKeyword:
      return 'any';

    case ts.SyntaxKind.UnknownKeyword:
      return 'unknown';

    case ts.SyntaxKind.FunctionType:
    case ts.SyntaxKind.FunctionExpression:
    case ts.SyntaxKind.FunctionKeyword:
    case ts.SyntaxKind.FunctionDeclaration:
      return 'function';
  }

  if (ts.isLiteralTypeNode(tsNode) && tsNode.literal.kind === ts.SyntaxKind.NullKeyword) {
    return 'null';
  }
}
