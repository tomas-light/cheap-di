import ts from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';
import { callFunction, callFunctionExpression } from './generation/callFunction.js';
import { constVariable } from './generation/constVariable.js';
import { constVariableWithDestructor } from './generation/constVariableWithDestructor.js';
import { objectAccessor } from './generation/objectAccessor.js';
import { tryCatchStatement } from './generation/tryCatchStatement.js';
import { constructorParametersToExpressions } from './constructorParametersToExpressions.js';
import { TransformOptions } from './TransformOptions.js';
import { immediateAsyncArrowFunction } from './generation/immediateAsyncArrowFunction.js';
import { requireImport } from './generation/requireImport.js';
import { awaitImport } from './generation/awaitImport.js';

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
 * CommonJs version
 * @example
 * try {
 *  const cheapDi = require('cheap-di');
 *  const { Bar } = require('package-1');
 *  cheapDi.saveConstructorMetadata(Foo, Bar);
 *
 *  try {
 *    const { Zoo } = require('package-2');
 *    cheapDi.saveConstructorMetadata(Bar, Zoo);
 *  } catch (error: unknown) {
 *    console.warn(error);
 *  }
 * } catch (error: unknown) {
 *  console.warn(error);
 * }
 *
 * EcmaScript modules version
 * @example
 * try {
 *  const cheapDi = await import('cheap-di');
 *  const { Bar } = await import('package-1');
 *  cheapDi.saveConstructorMetadata(Foo, Bar);
 *
 *  try {
 *    const { Zoo } = await import('package-2');
 *    cheapDi.saveConstructorMetadata(Bar, Zoo);
 *  } catch (error: unknown) {
 *    console.warn(error);
 *  }
 * } catch (error: unknown) {
 *  console.warn(error);
 * }
 */

export function createDependencyNodes(
  className: string,
  constructorParameters: ClassConstructorParameter[],
  options: TransformOptions
) {
  const cheapDiID = ts.factory.createIdentifier('cheapDi');
  const currentClassID = ts.factory.createIdentifier(className);

  return addDependenciesOfImportedDependencies(
    {
      shouldImportCheapDi: true,
      cheapDiID,
      currentClassID,
      currentClassName: className,
      constructorParameters,
    },
    options
  );
}

function addDependenciesOfImportedDependencies(
  codeInfo: {
    shouldImportCheapDi?: boolean;
    cheapDiID: ts.Identifier;
    currentClassID: ts.Identifier;
    currentClassName: string;
    constructorParameters: ClassConstructorParameter[] | undefined;
  },
  options: TransformOptions
): ts.Statement[] {
  const { shouldImportCheapDi, cheapDiID, currentClassID, currentClassName, constructorParameters } = codeInfo;

  if (!constructorParameters) {
    return [];
  }

  const parameterNodes = constructorParametersToExpressions(constructorParameters ?? []);

  let createImportExpression: (importedFrom: string) => ts.Expression;
  if (options.esmImports) {
    createImportExpression = awaitImport;
  } else {
    createImportExpression = requireImport;
  }

  return [
    tryCatchStatement(
      [
        ...(shouldImportCheapDi
          ? [
              // const cheapDi = require('cheap-di');
              constVariable(cheapDiID, createImportExpression('cheap-di')),
            ]
          : []),

        // const { SomeClass } = require('some-package');
        // const { SomeAnotherClass } = require('another-package');
        ...parameterNodes.imports.map(({ identifier, importedFrom, importType }) => {
          switch (importType) {
            case 'named':
              return constVariableWithDestructor(identifier, createImportExpression(importedFrom));

            case 'default':
            case 'namespace':
              return constVariable(identifier, createImportExpression(importedFrom));
          }
        }),

        ...(options.logRegisteredMetadata
          ? [
              // console.debug('[cheap-di-transformer] register metadata for', <className>, ...);
              callFunction(
                objectAccessor('console').property('debug'),
                ts.factory.createStringLiteral(`[cheap-di-transformer] register metadata for ${currentClassName}\n`),
                ts.factory.createStringLiteral(parameterNodes.namesToDebug.join('\n'))
              ),
            ]
          : []),

        // cheapDi.saveConstructorMetadata(<className>, <parameter1>, <parameter2>, ...)
        callFunction(
          objectAccessor(cheapDiID).property('saveConstructorMetadata'),
          currentClassID,
          ...parameterNodes.expressions
        ),

        ...parameterNodes.imports.flatMap(({ identifier, name, constructorParameters }) =>
          addDependenciesOfImportedDependencies(
            {
              cheapDiID,
              currentClassID: identifier,
              currentClassName: name,
              constructorParameters,
            },
            options
          )
        ),
      ],
      options
    ),
  ];
}
