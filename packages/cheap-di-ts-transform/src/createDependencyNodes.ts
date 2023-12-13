import ts from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';
import { arrayExpression } from './generation/arrayExpression.js';
import { assignValue } from './generation/assignValue.js';
import { callFunction } from './generation/callFunction.js';
import { constVariable } from './generation/constVariable.js';
import { constVariableWithDestructor } from './generation/constVariableWithDestructor.js';
import { objectAccessor } from './generation/objectAccessor.js';
import { tryCatchStatement } from './generation/tryCatchStatement.js';
import { constructorParametersToExpressions } from './constructorParametersToExpressions.js';

/**
 * @example
 * try {
 *  const cheapDi = require('cheap-di');
 *  const metadata = cheapDi.findOrCreateMetadata(<className>);
 *  const { SomeClass } = require('some-package');
 *  const { SomeAnotherClass } = require('another-package');
 *  metadata.dependencies = [SomeClass, SomeAnotherClass, <...parameters>];
 *
 *  try {
 *    const metadata = cheapDi.findOrCreateMetadata(SomeClass);
 *    const { SomeService } = require('some-package');
 *    metadata.dependencies = [SomeService];
 *    // ...
 *  } catch (error: unknown) {
 *    console.warn(error);
 *  }

 *  try {
 *    const metadata = cheapDi.findOrCreateMetadata(SomeAnotherClass);
 *    const { SomeService } = require('some-package');
 *    metadata.dependencies = [SomeService];
 *    // ...
 *  } catch (error: unknown) {
 *    console.warn(error);
 *  }
 * } catch (error: unknown) {
 *  console.warn(error);
 * }
*/

export function createDependencyNodes(className: string, parameters: ClassConstructorParameter[]) {
  const cheapDiId = ts.factory.createIdentifier('cheapDi');
  const classID = ts.factory.createIdentifier(className);

  return [
    tryCatchStatement([
      // const cheapDi = require('cheap-di');
      constVariable(cheapDiId, callFunction('require', ts.factory.createStringLiteral('cheap-di'))),

      ...addDependenciesOfImportedDependencies(cheapDiId, classID, parameters),
    ]),
  ];
}

function addDependenciesOfImportedDependencies(
  cheapDiID: ts.Identifier,
  currentClassID: ts.Identifier,
  constructorParameters: ClassConstructorParameter[] | undefined
): ts.Statement[] {
  if (!constructorParameters) {
    return [];
  }

  const parameterNodes = constructorParametersToExpressions(constructorParameters ?? []);

  return [
    tryCatchStatement([
      // const metadata = cheapDi.findOrCreateMetadata(<className>);
      constVariable(
        'metadata',
        callFunction(
          // cheapDi.findOrCreateMetadata
          objectAccessor(cheapDiID).property('findOrCreateMetadata'),
          currentClassID
        )
      ),

      // const { SomeClass } = require('some-package');
      // const { SomeAnotherClass } = require('another-package');
      ...parameterNodes.imports.map(({ identifier, importedFrom, importType }) => {
        switch (importType) {
          case 'named':
            return constVariableWithDestructor(
              identifier,
              callFunction('require', ts.factory.createStringLiteral(importedFrom))
            );

          case 'default':
          case 'namespace':
            return constVariable(identifier, callFunction('require', ts.factory.createStringLiteral(importedFrom)));
        }
      }),

      // metadata.dependencies = [<parameters>];
      assignValue(
        // metadata.dependencies
        objectAccessor('metadata').property('dependencies')
      ).value(
        // [<parameters>]
        arrayExpression(...parameterNodes.expressions)
      ),

      ...parameterNodes.imports.flatMap(({ identifier, constructorParameters }) =>
        addDependenciesOfImportedDependencies(cheapDiID, identifier, constructorParameters)
      ),
    ]),
  ];
}
