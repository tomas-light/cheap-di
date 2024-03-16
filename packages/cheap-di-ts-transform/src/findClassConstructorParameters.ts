import ts from 'typescript';
import { ClassConstructorParameter, ClassParameter, PrimitiveParameter } from './ClassConstructorParameter.js';
import { findPrimitiveTypes } from './findPrimitiveTypes.js';
import { InternalTransformOptions } from './InternalTransformOptions.js';
import { findConstructorDeclaration } from './findConstructorDeclaration.js';
import { findImportedEntity } from './findImportedEntity.js';
import { findNodeIdentifier } from './findNodeIdentifier.js';

export type ConstructorParametersInfo = {
  constructorParameter: ClassConstructorParameter;
};

export function findClassConstructorParameters(parameters: {
  typeChecker: ts.TypeChecker;
  classNode: ts.Node;
  options: InternalTransformOptions;
  addConstructorParametersInfo: (info: ConstructorParametersInfo) => void;
}): ClassConstructorParameter[] | undefined {
  const {
    //
    typeChecker,
    classNode,
    options,
    addConstructorParametersInfo,
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
        /** variable name
         * @example
         * constructor(parameter?: SomeClass)
         * // parameterNode is 'parameter'
         * */
        parameterNameIdentifier = parameterNode;
        return;
      }

      if (!parameterNameIdentifier) {
        // skip all code on the left of variable name
        // there may be keywords: public/private/readonly/ may be even decorators
        return;
      }

      classConstructorParameter.name = parameterNameIdentifier.getFullText().trim();

      const tsReferenceNode = findTypeReference(parameterNode);
      const nodeText4 = options?.debug ? tsReferenceNode?.getFullText() : '';

      if (tsReferenceNode) {
        const { identifier, identifierSymbol, namespaceIdentifier, namespaceIdentifierSymbol } = findNodeIdentifier(
          typeChecker,
          tsReferenceNode
        );
        if (!identifier || !identifierSymbol) {
          return;
        }

        const importedEntity = findImportedEntity({
          typeChecker,
          tsReferenceNode: tsReferenceNode,
          identifier,
          identifierSymbol,
          namespaceIdentifier,
          namespaceIdentifierSymbol,
        });

        if (importedEntity) {
          const classParameter = classConstructorParameter as unknown as ClassParameter;
          if (importedEntity.isClass) {
            classParameter.type = 'class';
            classParameter.importedClass = importedEntity;
          } else {
            classConstructorParameter.importedId = importedEntity.namedAsId ?? importedEntity.id;
          }
        }
      } else if (options.addDetailsToUnknownParameters) {
        const primitiveTypes = findPrimitiveTypes(parameterNode);
        if (primitiveTypes.length > 0) {
          const primitiveParameter = classConstructorParameter as unknown as PrimitiveParameter;
          primitiveParameter.type = 'primitive';
          primitiveParameter.primitiveTypes = primitiveTypes;
        }
      }
    });

    addConstructorParametersInfo({
      constructorParameter: classConstructorParameter,
    });
  }
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
