import ts from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';

// try {
//   if (!<className>[Symbol.metadata]) {
//     <className>[Symbol.metadata] = {};
//   }
//
//   const metadata = (${classLocalName}[Symbol.metadata]) as { [cheapDiSymbol]?: any[] };
//   if (!metadata[cheapDiSymbol]) {
//     metadata[cheapDiSymbol] = [];
//   }
//
//   metadata[cheapDiSymbol].push(<parameters>);
// } catch {

const metadataSymbolTextName = 'metadata';
const diMetadataSymbolTextName = 'cheapDiSymbol';

export function createDependencyNodes(className: string, parameters: ClassConstructorParameter[]) {
  const parameterNodes = parameters.reduce((expressions, parameter) => {
    if (parameter.type === 'class' && parameter.classReferenceLocalName) {
      return expressions.concat(ts.factory.createIdentifier(parameter.classReferenceLocalName));
    }

    return expressions.concat(ts.factory.createStringLiteral('unknown'));
  }, [] as ts.Expression[]);

  return [
    ts.factory.createTryStatement(
      ts.factory.createBlock(
        [
          assignMetadataIfNotAssignedNode(className),
          ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
              [
                ts.factory.createVariableDeclaration(
                  ts.factory.createIdentifier(metadataSymbolTextName),
                  undefined,
                  undefined,
                  ts.factory.createAsExpression(
                    ts.factory.createParenthesizedExpression(
                      ts.factory.createElementAccessExpression(
                        ts.factory.createIdentifier(className),
                        ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier('Symbol'),
                          ts.factory.createIdentifier(metadataSymbolTextName)
                        )
                      )
                    ),
                    ts.factory.createTypeLiteralNode([
                      ts.factory.createPropertySignature(
                        undefined,
                        ts.factory.createComputedPropertyName(ts.factory.createIdentifier(diMetadataSymbolTextName)),
                        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                        ts.factory.createArrayTypeNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword))
                      ),
                    ])
                  )
                ),
              ],
              ts.NodeFlags.Const
            )
          ),
          ts.factory.createIfStatement(
            ts.factory.createPrefixUnaryExpression(
              ts.SyntaxKind.ExclamationToken,
              ts.factory.createElementAccessExpression(
                ts.factory.createIdentifier(metadataSymbolTextName),
                ts.factory.createIdentifier(diMetadataSymbolTextName)
              )
            ),
            ts.factory.createBlock(
              [
                ts.factory.createExpressionStatement(
                  ts.factory.createBinaryExpression(
                    ts.factory.createElementAccessExpression(
                      ts.factory.createIdentifier(metadataSymbolTextName),
                      ts.factory.createIdentifier(diMetadataSymbolTextName)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.FirstAssignment),
                    ts.factory.createArrayLiteralExpression([], false)
                  )
                ),
              ],
              true
            ),
            undefined
          ),
          ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createElementAccessExpression(
                  ts.factory.createIdentifier(metadataSymbolTextName),
                  ts.factory.createIdentifier(diMetadataSymbolTextName)
                ),
                ts.factory.createIdentifier('push')
              ),
              undefined,
              parameterNodes
            )
          ),
        ],
        true
      ),
      ts.factory.createCatchClause(undefined, ts.factory.createBlock([], true)),
      undefined
    ),
  ];
}

// if (!<className>[Symbol.metadata]) {
//   <className>[Symbol.metadata] = {};
// }
const assignMetadataIfNotAssignedNode = (className: string) =>
  ts.factory.createIfStatement(
    hasNoMetadataNode(className),
    ts.factory.createBlock(
      [
        ts.factory.createExpressionStatement(
          ts.factory.createBinaryExpression(
            metadataAccessNode(className),
            ts.factory.createToken(ts.SyntaxKind.FirstAssignment),
            ts.factory.createObjectLiteralExpression([], false)
          )
        ),
      ],
      true
    ),
    undefined
  );

// !<className>[Symbol.metadata]
const hasNoMetadataNode = (className: string) =>
  ts.factory.createPrefixUnaryExpression(ts.SyntaxKind.ExclamationToken, metadataAccessNode(className));

// <className>[Symbol.metadata]
const metadataAccessNode = (className: string) =>
  ts.factory.createElementAccessExpression(
    ts.factory.createIdentifier(className),
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier('Symbol'),
      ts.factory.createIdentifier(metadataSymbolTextName)
    )
  );
