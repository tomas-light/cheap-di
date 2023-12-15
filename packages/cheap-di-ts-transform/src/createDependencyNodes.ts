import ts from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';
import { callFunction, callFunctionExpression } from './generation/callFunction.js';
import { constVariable } from './generation/constVariable.js';
import { constVariableWithDestructor } from './generation/constVariableWithDestructor.js';
import { objectAccessor } from './generation/objectAccessor.js';
import { tryCatchStatement } from './generation/tryCatchStatement.js';
import { constructorParametersToExpressions } from './constructorParametersToExpressions.js';
import { TransformOptions } from './TransformOptions.js';

/**
 * @example
 * try {
 *  const cheapDi = require('cheap-di');
 *  const { SomeClass } = require('some-package');
 *  const { SomeAnotherClass } = require('another-package');
 *  cheapDi.saveConstructorMetadata(<className>, SomeClass, SomeAnotherClass, <...parameters>);
 *
 *  try {
 *    const { SomeService } = require('some-package');
 *    cheapDi.saveConstructorMetadata(SomeClass, SomeService);
 *    // ...
 *  } catch (error: unknown) {
 *    console.warn(error);
 *  }

 *  try {
 *    const { SomeService } = require('some-package');
 *    cheapDi.saveConstructorMetadata(SomeAnotherClass, SomeService);
 *    // ...
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
    constructorParameters: ClassConstructorParameter[] | undefined;
  },
  options: TransformOptions
): ts.Statement[] {
  const { shouldImportCheapDi, cheapDiID, currentClassID, constructorParameters } = codeInfo;

  if (!constructorParameters) {
    return [];
  }

  const parameterNodes = constructorParametersToExpressions(constructorParameters ?? []);

  return [
    tryCatchStatement([
      ...(shouldImportCheapDi
        ? [
            // const cheapDi = require('cheap-di');
            constVariable(cheapDiID, callFunctionExpression('require', ts.factory.createStringLiteral('cheap-di'))),
          ]
        : []),

      // const { SomeClass } = require('some-package');
      // const { SomeAnotherClass } = require('another-package');
      ...parameterNodes.imports.map(({ identifier, importedFrom, importType }) => {
        switch (importType) {
          case 'named':
            return constVariableWithDestructor(
              identifier,
              callFunctionExpression('require', ts.factory.createStringLiteral(importedFrom))
            );

          case 'default':
          case 'namespace':
            return constVariable(
              identifier,
              callFunctionExpression('require', ts.factory.createStringLiteral(importedFrom))
            );
        }
      }),

      ...(options.logClassNames
        ? [
            // console.debug('[cheap-di-transformer] register metadata for', <className>);
            callFunction(
              // console.debug
              objectAccessor('console').property('debug'),
              ts.factory.createStringLiteral('[cheap-di-transformer] register metadata for'),
              currentClassID
            ),
          ]
        : []),

      // cheapDi.saveConstructorMetadata(<className>, <parameter1>, <parameter2>, ...)
      callFunction(
        objectAccessor(cheapDiID).property('saveConstructorMetadata'),
        currentClassID,
        ...parameterNodes.expressions
      ),

      ...parameterNodes.imports.flatMap(({ identifier, constructorParameters }) =>
        addDependenciesOfImportedDependencies(
          {
            cheapDiID,
            currentClassID: identifier,
            constructorParameters,
          },
          options
        )
      ),
    ]),
  ];
}
