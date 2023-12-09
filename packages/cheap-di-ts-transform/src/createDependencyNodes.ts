import ts from 'typescript';
import {
  ClassConstructorParameter,
  ImportedClass,
  isClassParameter,
  isImportedClass,
  isLocalClass,
  isPrimitiveParameter,
} from './ClassConstructorParameter.js';
import { arrayExpression } from './generation/arrayExpression.js';
import { assignValue } from './generation/assignValue.js';
import { callFunction } from './generation/callFunction.js';
import { constVariable } from './generation/constVariable.js';
import { constVariableWithDestructor } from './generation/constVariableWithDestructor.js';
import { objectAccessor } from './generation/objectAccessor.js';
import { tryCatchStatement } from './generation/tryCatchStatement.js';

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

type Import = Omit<ImportedClass, 'classNameInImport'> & {
  identifier: ts.Identifier;
};

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

function constructorParametersToExpressions(parameters: ClassConstructorParameter[] | undefined) {
  const initial = {
    expressions: [] as ts.Expression[],
    imports: [] as Import[],
  };

  if (!parameters) {
    return initial;
  }

  return parameters.reduce((_parameters, parameter) => {
    const unknown = () => {
      const parameterName = !isClassParameter(parameter) ? parameter.name : '<no_name>';
      const unknownString = `unknown /${parameterName}/`;

      const unknownStringLiteral = ts.factory.createStringLiteral(unknownString);
      _parameters.expressions.push(unknownStringLiteral);
      return _parameters;
    };

    if (isClassParameter(parameter)) {
      if (!parameter.classReference) {
        return unknown();
      }

      if (isLocalClass(parameter.classReference)) {
        const id = ts.factory.createIdentifier(parameter.classReference.localName);
        _parameters.expressions.push(id);
        return _parameters;
      }

      if (isImportedClass(parameter.classReference)) {
        const id = ts.factory.createIdentifier(parameter.classReference.classNameInImport);
        _parameters.expressions.push(id);
        _parameters.imports.push({
          identifier: id,
          ...parameter.classReference,
        });
        return _parameters;
      }
    } else if (isPrimitiveParameter(parameter)) {
      let primitiveString = 'primitive';
      if (parameter.name) {
        primitiveString += ` /${parameter.name}/ `;
      } else {
        primitiveString += ' /<no_name>/ ';
      }

      parameter.primitiveTypes.forEach((type) => {
        primitiveString += `:${type}`;
      });

      const primitiveStringLiteral = ts.factory.createStringLiteral(primitiveString);
      _parameters.expressions.push(primitiveStringLiteral);
      return _parameters;
    }

    return unknown();
  }, initial);
}
