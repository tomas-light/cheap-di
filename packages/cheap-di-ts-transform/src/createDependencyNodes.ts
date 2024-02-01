import ts from 'typescript';
import { callFunction } from './generation/callFunction.js';
import { objectAccessor } from './generation/objectAccessor.js';
import { tryCatchStatement } from './generation/tryCatchStatement.js';
import { InternalTransformOptions } from './InternalTransformOptions.js';
import { importDeclaration } from './generation/importDeclaration/index.js';
import { createIdentifierOfIdentifier } from './generation/createIdentifierOfIdentifier.js';
import { defined } from './defined.js';
import { TransformationGenerations } from './TransformationGenerations.js';

/**
 * your code example
 * @example
 * // package-1/index.ts
 * import { Zoo } from 'package-2';
 *
 * class Bar {
 *   constructor(zoo: Zoo) {}
 * }
 *
 * // <your src>/index.ts
 * import { Bar } from 'package-1';
 *
 * class Foo {
 *   constructor(bar: Bar) {}
 * }
 *
 * modified code
 * @example
 * // <your src>/index.ts
 * import { Bar } from 'package-1';
 * import cheap_di_1 from 'cheap-di';
 * import * as package_for_cheap_di_1 from 'package-1';
 * const { Bar: Bar_1 } = package_for_cheap_di_1;
 *
 * class Foo {
 *   constructor(bar: Bar) {}
 * }
 * try {
 *  cheap_di_1.saveConstructorMetadata(Foo, Bar_1);
 * } catch (error: unknown) {
 *  console.warn(error);
 * }
 */

export function createDependencyNodes(params: {
  typeChecker: ts.TypeChecker;
  className: string;
  namesToDebug: string[];
  savingMetadataNodes: (ts.Identifier | ts.StringLiteral)[];
  options: InternalTransformOptions;
  localHash: string;
  generations: TransformationGenerations;
}) {
  const { typeChecker, className, namesToDebug, savingMetadataNodes, options, localHash, generations } = params;
  const { logRegisteredMetadata } = options;

  let cheapDiID: ts.Identifier;
  const currentClassID = ts.factory.createIdentifier(className);

  const importedCheapDiIdentifier = generations.getCheapDiIdentifier();
  if (importedCheapDiIdentifier) {
    cheapDiID = createIdentifierOfIdentifier(typeChecker, importedCheapDiIdentifier);
  } else {
    const { identifier, importDeclarationNode } = importDeclaration().from('cheap-di').default(`cheap_di_${localHash}`);

    cheapDiID = createIdentifierOfIdentifier(typeChecker, identifier);
    generations.addCheapDi({
      identifier,
      generatedImportDeclaration: importDeclarationNode,
    });
  }

  const statement = tryCatchStatement(
    [
      // console.debug('[cheap-di-transformer] register metadata for', <className>, ...);
      logRegisteredMetadata
        ? callFunction(
            objectAccessor('console').property('debug'),
            ts.factory.createStringLiteral(`[cheap-di-transformer] register metadata for ${className}\n`),
            ts.factory.createStringLiteral(namesToDebug.join('\n'))
          )
        : null,

      // cheapDi.saveConstructorMetadata(<className>, <parameter1>, <parameter2>, ...)
      callFunction(
        objectAccessor(cheapDiID).property('saveConstructorMetadata'),
        currentClassID,
        ...savingMetadataNodes
      ),
    ].filter(defined),
    options
  );

  return statement;
}
