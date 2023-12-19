import ts from 'typescript';
import { ClassConstructorParameter, PrimitiveParameter } from './ClassConstructorParameter.js';
import { correctClassParameterIfItIsValid } from './correctClassParameterIfItIsValid.js';
import { findPrimitiveTypes } from './findPrimitiveTypes.js';
import { InternalTransformOptions } from './InternalTransformOptions.js';
import { findConstructorDeclaration } from './findConstructorDeclaration.js';

export function findClassConstructorParameters(parameters: {
  currentImportFrom?: string;
  typeChecker: ts.TypeChecker;
  classNode: ts.Node;
  constructorParameters?: ClassConstructorParameter[];
  options: InternalTransformOptions;
}): ClassConstructorParameter[] | undefined {
  const {
    //
    currentImportFrom,
    typeChecker,
    classNode,
    constructorParameters = [],
    options,
  } = parameters;

  const constructorDeclaration = findConstructorDeclaration(classNode, options);
  if (!constructorDeclaration) {
    return;
  }

  const parameterDeclarations = findConstructorParameterDeclarations(constructorDeclaration, options);
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

      const typeReferencedNode = findTypeReference(parameterNode);
      const nodeText4 = options?.debug ? typeReferencedNode?.getFullText() : '';

      classConstructorParameter.name = parameterNameIdentifier.getFullText().trim();

      if (typeReferencedNode) {
        correctClassParameterIfItIsValid({
          typeChecker,
          tsNode: typeReferencedNode,
          outClassConstructorParameter: classConstructorParameter,
          currentImportFrom,
          findClassConstructorParameters: (_parameters) => {
            if (!options.deepRegistration) {
              return undefined;
            }

            return findClassConstructorParameters({
              typeChecker,
              ..._parameters,
              options,
            });
          },
        });
      } else if (options.addDetailsToUnknownParameters) {
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

function findConstructorParameterDeclarations(
  constructorDeclaration: ts.ConstructorDeclaration,
  options: InternalTransformOptions
) {
  const parameterDeclarations: ts.ParameterDeclaration[] = [];

  constructorDeclaration.forEachChild((node) => {
    const nodeText2 = options?.debug ? node.getFullText() : '';
    if (ts.isParameter(node)) {
      parameterDeclarations.push(node);
    }
  });

  return parameterDeclarations;
}

function findTypeReference(parameterNode: ts.Node) {
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

  if (ts.isTypeReferenceNode(typeReferencedNode)) {
    return typeReferencedNode;
  }

  return undefined;
}
