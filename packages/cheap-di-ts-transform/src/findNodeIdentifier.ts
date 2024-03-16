import ts from 'typescript';

export function findNodeIdentifier(typeChecker: ts.TypeChecker, tsReferenceNode: ts.TypeReferenceNode) {
  let identifier: ts.Identifier | undefined;
  let identifierSymbol: ts.Symbol | undefined;

  let isNamespacedNode = false;
  let namespaceIdentifier: ts.Identifier | undefined;
  let namespaceIdentifierSymbol: ts.Symbol | undefined;

  const nodeText = tsReferenceNode.getFullText();
  const children = tsReferenceNode.getChildren();

  while (children.length) {
    const nodeChild = children.shift();
    if (!nodeChild) {
      break;
    }

    /**
     * @example
     * import type * as package1 from 'package1';
     *
     * class Foo {
     *   constructor(some: package1.Some) {} // here is TypeReferenceNode contains QualifiedName children,
     *   that contains:
     *    - identifier (package1)
     *    - DotToken
     *    - identifier (Some)
     * }
     * */
    if (ts.isQualifiedName(nodeChild)) {
      isNamespacedNode = true;
      const _children = nodeChild.getChildren();
      children.push(..._children);
      continue;
    }

    if (ts.isIdentifier(nodeChild)) {
      if (isNamespacedNode && !namespaceIdentifier) {
        // skip first ID, because it is ID of namespace
        namespaceIdentifier = nodeChild;
        namespaceIdentifierSymbol = typeChecker.getSymbolAtLocation(nodeChild);
        continue;
      }

      identifier = nodeChild;
      identifierSymbol = typeChecker.getSymbolAtLocation(nodeChild);
      break;
    }
  }

  return {
    identifier,
    identifierSymbol,
    namespaceIdentifier,
    namespaceIdentifierSymbol,
  };
}
