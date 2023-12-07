import ts from 'typescript';
import { createDependencyNodes } from './createDependencyNodes.js';
import { makeConstructorFinder } from './makeConstructorFinder.js';
import { TransformOptions } from './TransformOptions.js';

export function makeClassFinder(
  context: ts.TransformationContext,
  typeChecker: ts.TypeChecker,
  options: TransformOptions
) {
  const fileRef = {
    hasDependencies: false,
  };

  function classFinder(tsNode: ts.Node): ts.Node | ts.Node[] {
    const nodeText = options?.debug ? tsNode.getFullText() : '';
    if (!ts.isClassDeclaration(tsNode)) {
      return ts.visitEachChild(tsNode, classFinder, context);
    }

    const classDeclaration = tsNode;

    const { ref, constructorFinder } = makeConstructorFinder(context, typeChecker, options);

    ts.visitEachChild(classDeclaration, constructorFinder, context);

    const { classLocalName, parameters } = ref;

    if (!classLocalName || !parameters.length) {
      return classDeclaration;
    }

    fileRef.hasDependencies = true;

    const dependencyRegistrationNodes = createDependencyNodes(classLocalName, parameters);
    return [classDeclaration, ...dependencyRegistrationNodes];
  }

  return {
    ref: fileRef,
    classFinder,
  };
}
