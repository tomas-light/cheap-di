import ts from 'typescript';
import { ClassConstructorParameter, ClassParameter, ImportedClass, LocalClass } from './ClassConstructorParameter.js';
import { correctClassParameterIfItIsValid } from './correctClassParameterIfItIsValid.js';
import { findClassIdentifierSymbol } from './findClassIdentifierSymbol.js';
import { findImports } from './findImports.js';
import { isThereClassInDeclarations } from './isThereClassInDeclarations.js';

export function makeConstructorFinder(context: ts.TransformationContext, typeChecker: ts.TypeChecker) {
  const ref = {
    classLocalName: undefined as string | undefined,
    parameters: [] as ClassConstructorParameter[],
  };

  function constructorFinder(classNode: ts.Node): ts.Node {
    if (ts.isIdentifier(classNode)) {
      if (!ref.classLocalName) {
        const identifierSymbol = typeChecker.getSymbolAtLocation(classNode);
        ref.classLocalName = identifierSymbol?.escapedName.toString();
      }
      return classNode;
    }

    if (!ts.isConstructorDeclaration(classNode)) {
      return ts.visitEachChild(classNode, constructorFinder, context);
    }

    const constructorDeclaration: ts.ConstructorDeclaration = classNode;

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
      ref.parameters.push(classConstructorParameter);

      /** handle case when some of dependencies can be missed because of your container setup
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
            correctClassParameterIfItIsValid(typeChecker, typeReferencedNode, classConstructorParameter);
          }
          return;
        }

        if (ts.isTypeReferenceNode(parameterNode)) {
          correctClassParameterIfItIsValid(typeChecker, parameterNode, classConstructorParameter);
        }
      });
    }

    return constructorDeclaration;
  }

  return {
    ref,
    constructorFinder,
  };
}
