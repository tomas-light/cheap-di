import ts from 'typescript';
import { ClassConstructorParameter, PrimitiveParameter } from './ClassConstructorParameter.js';
import { correctClassParameterIfItIsValid } from './correctClassParameterIfItIsValid.js';
import { TransformOptions } from './TransformOptions.js';
import { findPrimitiveTypes } from './findPrimitiveTypes.js';

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
    let parameterNameIdentifier: ts.Identifier | undefined;

    parameterDeclaration.forEachChild((parameterNode) => {
      const nodeText3 = options?.debug ? parameterNode.getFullText() : '';

      if (ts.isDecorator(parameterNode)) {
        // constructor(@inject parameter: SomeClass)
        return;
      }
      if (ts.isQuestionToken(parameterNode)) {
        // constructor(parameter?: SomeClass)
        return;
      }
      if (ts.isIdentifier(parameterNode)) {
        parameterNameIdentifier = parameterNode;
        return;
      }

      if (!parameterNameIdentifier) {
        // skip all code on the left of variable name
        // there may be keywords: public/private/readonly/ may be even decorators
        return;
      }

      let typeReferencedNode = parameterNode;

      if (ts.isUnionTypeNode(parameterNode)) {
        let founded = false; // take only first type reference
        parameterNode.forEachChild((unionNode) => {
          if (!founded && ts.isTypeReferenceNode(unionNode)) {
            typeReferencedNode = unionNode;
            founded = true;
          }
        });
      }
      const nodeText4 = options?.debug ? typeReferencedNode.getFullText() : '';

      if (ts.isTypeReferenceNode(typeReferencedNode)) {
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
      } else if (options.addDetailsToUnknownParameters) {
        classConstructorParameter.name = parameterNameIdentifier.getFullText().trim();

        const primitiveTypes = findPrimitiveTypes(parameterNode);
        if (primitiveTypes.length > 0) {
          const primitiveParameter = classConstructorParameter as unknown as PrimitiveParameter;
          primitiveParameter.type = 'primitive';
          primitiveParameter.primitiveTypes = primitiveTypes;
        }
      }
    });
  }

  return constructorParameters;
}
