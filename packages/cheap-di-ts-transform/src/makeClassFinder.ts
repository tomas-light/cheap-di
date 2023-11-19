import ts from 'typescript';
import { createDependencyNodes } from './createDependencyNodes.js';
import { makeConstructorFinder } from './makeConstructorFinder.js';

export function makeClassFinder(
  context: ts.TransformationContext,
  typeChecker: ts.TypeChecker,
  ids?: Parameters<typeof createDependencyNodes>[2]
) {
  const fileRef = {
    hasDependencies: false,
  };

  function classFinder(tsNode: ts.Node): ts.Node | ts.Node[] {
    if (!ts.isClassDeclaration(tsNode)) {
      return ts.visitEachChild(tsNode, classFinder, context);
    }

    const classDeclaration = tsNode;

    const { ref, constructorFinder } = makeConstructorFinder(context, typeChecker);

    ts.visitEachChild(classDeclaration, constructorFinder, context);

    const { classLocalName, parameters } = ref;

    if (!classLocalName || !parameters.length) {
      return classDeclaration;
    }

    fileRef.hasDependencies = true;

    const dependencyRegistrationNodes = createDependencyNodes(classLocalName, parameters, ids);
    return [classDeclaration, ...dependencyRegistrationNodes];
  }

  return {
    ref: fileRef,
    classFinder,
  };
}
