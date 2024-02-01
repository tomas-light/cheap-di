import ts from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';
import { findClassConstructorParameters } from './findClassConstructorParameters.js';
import { InternalTransformOptions } from './InternalTransformOptions.js';

export type ConstructorDependenciesInformationChunk = Partial<{
  targetClassLocalName: string | undefined;
  constructorParameter: ClassConstructorParameter;
}>;

export function makeConstructorFinder(params: {
  context: ts.TransformationContext;
  typeChecker: ts.TypeChecker;
  options: InternalTransformOptions;
  addConstructorDependenciesInformation: (infoChunk: ConstructorDependenciesInformationChunk) => void;
}) {
  const { context, typeChecker, options, addConstructorDependenciesInformation } = params;

  let identifier: ts.Identifier | undefined;

  return function constructorFinder(nodeInsideClass: ts.Node): ts.Node {
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
      if (!identifier) {
        identifier = nodeInsideClass;
        addConstructorDependenciesInformation({
          targetClassLocalName: nodeInsideClass.getFullText().trim(),
        });
      }
      return nodeInsideClass;
    }

    if (!ts.isConstructorDeclaration(nodeInsideClass)) {
      return ts.visitEachChild(nodeInsideClass, constructorFinder, context);
    }

    const constructorDeclaration = nodeInsideClass;

    findClassConstructorParameters({
      typeChecker,
      classNode: constructorDeclaration,
      addConstructorParametersInfo: addConstructorDependenciesInformation,
      options,
    });

    return constructorDeclaration;
  };
}
