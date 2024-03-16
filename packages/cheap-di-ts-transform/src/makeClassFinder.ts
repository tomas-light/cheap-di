import ts from 'typescript';
import { createDependencyNodes } from './createDependencyNodes.js';
import { makeConstructorFinder } from './makeConstructorFinder.js';
import { InternalTransformOptions } from './InternalTransformOptions.js';
import { TransformationGenerations } from './TransformationGenerations.js';
import { createMetadataNode, isGeneratedImport } from './createMetadataNode.js';

export function makeClassFinder(params: {
  context: ts.TransformationContext;
  typeChecker: ts.TypeChecker;
  options: InternalTransformOptions;
  generations: TransformationGenerations;
  localHash: string;
}) {
  const { context, typeChecker, options, generations, localHash } = params;

  return function classFinder(tsNode: ts.Node) {
    /**
     * names of class parameters to log them in debug node
     * @example
     * class A {
     *   constructor(name1: Foo, name2: Bar, name3: string)
     * }
     * // namesToDebug is
     * ['name1', 'name2', 'name3']
     * */
    const namesToDebug: string[] = [];

    /**
     * @example
     * cheapDi.saveConstructorMetadata(SomeClass, 'unknown /variable_name/', Foo, 'primitive /name2/', Bar, 'primitive /<no_name>/:string');
     * // savingMetadataNodes is
     * ['unknown /variable_name/', Foo, 'primitive /name2/', Bar, 'primitive /<no_name>/:string']
     * */
    const savingMetadataNodes: (ts.Identifier | ts.StringLiteral)[] = [];

    const currentClass: {
      name?: string;
    } = {};

    const nodeText = options?.debug ? tsNode.getFullText() : '';
    if (!ts.isClassDeclaration(tsNode)) {
      return ts.visitEachChild(tsNode, classFinder, context);
    }

    const classDeclaration = tsNode;

    const constructorFinder = makeConstructorFinder({
      context,
      typeChecker,
      options,
      addConstructorDependenciesInformation: (infoChunk) => {
        const { targetClassLocalName, constructorParameter } = infoChunk;

        if (targetClassLocalName) {
          currentClass.name = targetClassLocalName;
        }

        if (constructorParameter) {
          const metadataNode = createMetadataNode({
            typeChecker,
            parameter: constructorParameter,
            localHash,
          });

          if (metadataNode) {
            const { nameToDebug, node } = metadataNode;

            namesToDebug.push(nameToDebug);
            savingMetadataNodes.push(node);

            if (!isGeneratedImport(metadataNode)) {
              return;
            }

            const { from, importDeclarations: _importDeclarations } = metadataNode;
            generations.addImport({ from, nodes: _importDeclarations.slice() });
          }
        }
      },
    });

    ts.visitEachChild(classDeclaration, constructorFinder, context);

    if (!currentClass.name || !savingMetadataNodes.length) {
      return classDeclaration;
    }

    const generatedCode = createDependencyNodes({
      typeChecker,
      className: currentClass.name,
      namesToDebug,
      savingMetadataNodes,
      options,
      localHash,
      generations,
    });

    if (!generatedCode) {
      return classDeclaration;
    }

    return [classDeclaration, generatedCode];
  };
}
