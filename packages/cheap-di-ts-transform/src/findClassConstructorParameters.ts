import ts, { SyntaxKind } from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';
import { correctClassParameterIfItIsValid } from './correctClassParameterIfItIsValid.js';
import { TransformOptions } from './TransformOptions.js';

export function findClassConstructorParameters(parameters: {
  currentImportFrom?: string;
  typeChecker: ts.TypeChecker;
  classNode: ts.Node;
  constructorParameters?: ClassConstructorParameter[];
  options: TransformOptions;
}): ClassConstructorParameter[] | undefined {
  const {
    //
    currentImportFrom,
    typeChecker,
    classNode,
    constructorParameters = [],
    options,
  } = parameters;

  let constructorDeclaration: ts.ConstructorDeclaration | undefined;

  const classNodeText = options?.debug ? classNode.getFullText() : '';
  if (ts.isConstructorDeclaration(classNode)) {
    constructorDeclaration = classNode;
  } else {
    for (const childNode of classNode.getChildren()) {
      const childNodeText = options?.debug ? childNode.getFullText() : '';
      if (childNode.kind !== SyntaxKind.SyntaxList) {
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
  }

  if (!constructorDeclaration) {
    return;
  }

  const parameterDeclarations: ts.ParameterDeclaration[] = [];
  constructorDeclaration.forEachChild((node) => {
    const nodeText2 = options?.debug ? node.getFullText() : '';
    if (ts.isParameter(node)) {
      parameterDeclarations.push(node);
    }
  });

  for (const parameterDeclaration of parameterDeclarations) {
    const classConstructorParameter: ClassConstructorParameter = {
      type: 'unknown',
    };
    constructorParameters.push(classConstructorParameter);

    /** handle case when some of the dependencies can be missed because of your container setup
     * class Service {
     *   constructor(some?: SomeService | null | undefined) {}
     * }
     * */
    parameterDeclaration.forEachChild((parameterNode) => {
      const nodeText3 = options?.debug ? parameterNode.getFullText() : '';
      if (ts.isUnionTypeNode(parameterNode)) {
        let typeReferencedNode: ts.TypeReferenceNode | undefined;

        parameterNode.forEachChild((unionNode) => {
          if (!typeReferencedNode && ts.isTypeReferenceNode(unionNode)) {
            typeReferencedNode = unionNode;
          }
        });

        if (typeReferencedNode) {
          correctClassParameterIfItIsValid({
            typeChecker,
            tsNode: typeReferencedNode,
            outClassConstructorParameter: classConstructorParameter,
            currentImportFrom,
            findClassConstructorParameters: (_parameters) =>
              findClassConstructorParameters({
                typeChecker,
                ..._parameters,
                options,
              }),
          });
        }
        return;
      }

      if (ts.isTypeReferenceNode(parameterNode)) {
        correctClassParameterIfItIsValid({
          typeChecker,
          tsNode: parameterNode,
          outClassConstructorParameter: classConstructorParameter,
          currentImportFrom,
          findClassConstructorParameters: (_parameters) =>
            findClassConstructorParameters({
              typeChecker,
              ..._parameters,
              options,
            }),
        });
      }
    });
  }

  return constructorParameters;
}
