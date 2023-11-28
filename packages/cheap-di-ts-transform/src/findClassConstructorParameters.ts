import ts, { SyntaxKind } from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';
import { correctClassParameterIfItIsValid } from './correctClassParameterIfItIsValid.js';

export function findClassConstructorParameters(
  typeChecker: ts.TypeChecker,
  classNode: ts.Node,
  constructorParameters: ClassConstructorParameter[] = []
): ClassConstructorParameter[] | undefined {
  let constructorDeclaration: ts.ConstructorDeclaration | undefined;

  if (ts.isConstructorDeclaration(classNode)) {
    constructorDeclaration = classNode;
  } else {
    for (const childNode of classNode.getChildren()) {
      if (childNode.kind !== SyntaxKind.SyntaxList) {
        continue;
      }

      for (const tsNode of childNode.getChildren()) {
        if (ts.isConstructorDeclaration(tsNode)) {
          constructorDeclaration = tsNode;
          break;
        }
      }
      // no need to iterate over other nodes
      break;
    }
  }

  if (!constructorDeclaration) {
    return;
  }

  const parameterDeclarations: ts.ParameterDeclaration[] = [];
  constructorDeclaration.forEachChild((node) => {
    if (ts.isParameter(node)) {
      parameterDeclarations.push(node);
    }
  });

  for (const parameterDeclaration of parameterDeclarations) {
    const classConstructorParameter: ClassConstructorParameter = {
      type: 'unknown',
    };
    constructorParameters.push(classConstructorParameter);

    const nextFindParameters = findClassConstructorParameters.bind(null, typeChecker);

    /** handle case when some of the dependencies can be missed because of your container setup
     * class Service {
     *   constructor(some?: SomeService | null | undefined) {}
     * }
     * */
    parameterDeclaration.forEachChild((parameterNode) => {
      if (ts.isUnionTypeNode(parameterNode)) {
        let typeReferencedNode: ts.TypeReferenceNode | undefined;

        parameterNode.forEachChild((unionNode) => {
          if (!typeReferencedNode && ts.isTypeReferenceNode(unionNode)) {
            typeReferencedNode = unionNode;
          }
        });

        if (typeReferencedNode) {
          correctClassParameterIfItIsValid(
            typeChecker,
            typeReferencedNode,
            classConstructorParameter,
            nextFindParameters
          );
        }
        return;
      }

      if (ts.isTypeReferenceNode(parameterNode)) {
        correctClassParameterIfItIsValid(typeChecker, parameterNode, classConstructorParameter, nextFindParameters);
      }
    });
  }

  return constructorParameters;
}
