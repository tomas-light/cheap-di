import ts from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';
import { findClassConstructorParameters } from './findClassConstructorParameters.js';

export function makeConstructorFinder(context: ts.TransformationContext, typeChecker: ts.TypeChecker) {
  const ref = {
    classLocalName: undefined as string | undefined,
    parameters: [] as ClassConstructorParameter[],
  };

  function constructorFinder(nodeInsideClass: ts.Node): ts.Node {
    if (ts.isIdentifier(nodeInsideClass)) {
      // first identifier in class is a class identifier (class reference)
      if (!ref.classLocalName) {
        const identifierSymbol = typeChecker.getSymbolAtLocation(nodeInsideClass);
        ref.classLocalName = identifierSymbol?.escapedName.toString();
      }
      return nodeInsideClass;
    }

    if (!ts.isConstructorDeclaration(nodeInsideClass)) {
      return ts.visitEachChild(nodeInsideClass, constructorFinder, context);
    }

    findClassConstructorParameters({
      typeChecker,
      classNode: nodeInsideClass,
      constructorParameters: ref.parameters,
    });

    return nodeInsideClass;
  }

  return {
    ref,
    constructorFinder,
  };
}
