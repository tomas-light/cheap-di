import ts from 'typescript';
import { makeConstructorFinder } from './makeConstructorFinder.js';
import { createDependencyNodes } from './createDependencyNodes.js';

export function makeClassFinder(context: ts.TransformationContext, typeChecker: ts.TypeChecker) {
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

    //     const parametersToArrayItems = parameters.reduce((sourceString, parameter) => {
    //       if (parameter.type === 'class' && parameter.classReferenceLocalName) {
    //         if (sourceString) {
    //           return sourceString + `, ${parameter.classReferenceLocalName}`;
    //         }
    //
    //         return parameter.classReferenceLocalName;
    //       }
    //
    //       if (sourceString) {
    //         return sourceString + `, "${parameter.type}"`;
    //       }
    //
    //       return `"${parameter.type}"`;
    //     }, '');
    //
    //     const code = `\
    // try {
    //   if (!${classLocalName}[Symbol.metadata]) {
    //     ${classLocalName}[Symbol.metadata] = {};
    //   }
    //
    //   const metadata = (${classLocalName}[Symbol.metadata]) as { [dependenciesSymbolCheapDI]?: any[] };
    //   if (!metadata[dependenciesSymbolCheapDI]) {
    //     metadata[dependenciesSymbolCheapDI] = [];
    //   }
    //
    //   metadata[dependenciesSymbolCheapDI].push(${parametersToArrayItems});
    // } catch {}\
    // `;
    // const nodeGenerationCode = tsCreator(code);

    const dependencyRegistrationNodes = createDependencyNodes(classLocalName, parameters);
    return [classDeclaration, ...dependencyRegistrationNodes];
  }

  return {
    ref: fileRef,
    classFinder,
  };
}
