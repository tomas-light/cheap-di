import ts from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';
import { findClassConstructorParameters } from './findClassConstructorParameters.js';
import { InternalTransformOptions } from './InternalTransformOptions.js';

export function makeConstructorFinder(
  context: ts.TransformationContext,
  typeChecker: ts.TypeChecker,
  options: InternalTransformOptions
) {
  const ref = {
    classLocalName: undefined as string | undefined,
    parameters: [] as ClassConstructorParameter[],
  };

  return {
    ref,
    constructorFinder,
  };

  function constructorFinder(nodeInsideClass: ts.Node): ts.Node {
    const nodeText = options?.debug ? nodeInsideClass.getFullText() : '';

    /**
     * skip class decorators
     * @example
     * @myDecorator
     * class MyClass {}
     * */
    if (ts.isDecorator(nodeInsideClass)) {
      return nodeInsideClass;
    }

    if (ts.isIdentifier(nodeInsideClass)) {
      // first identifier in class is a class identifier (class reference)
      if (!ref.classLocalName) {
        ref.classLocalName = nodeInsideClass.getFullText().trim();
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
      options,
    });

    return nodeInsideClass;
  }
}
