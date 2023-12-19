import ts from 'typescript';
import { InternalTransformOptions } from './InternalTransformOptions.js';

export function findConstructorDeclaration(classNode: ts.Node, options: InternalTransformOptions) {
  const classNodeText = options?.debug ? classNode.getFullText() : '';

  if (ts.isConstructorDeclaration(classNode)) {
    return classNode;
  }

  let constructorDeclaration: ts.ConstructorDeclaration | undefined;

  for (const childNode of classNode.getChildren()) {
    const childNodeText = options?.debug ? childNode.getFullText() : '';
    if (childNode.kind !== ts.SyntaxKind.SyntaxList) {
      continue;
    }

    for (const tsNode of childNode.getChildren()) {
      const nodeText = options?.debug ? tsNode.getFullText() : '';
      if (ts.isConstructorDeclaration(tsNode)) {
        constructorDeclaration = tsNode;
        break;
      }
    }

    if (constructorDeclaration) {
      // no need to iterate over other nodes
      break;
    }
  }

  return constructorDeclaration;
}
