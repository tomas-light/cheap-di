import ts from 'typescript';
import {
  ClassConstructorParameter,
  ImportedClass,
  isClassParameter,
  isImportedClass,
  isLocalClass,
} from './ClassConstructorParameter.js';
import { arrayExpression } from './generation/arrayExpression.js';
import { assignValue } from './generation/assignValue.js';
import { callFunction } from './generation/callFunction.js';
import { constVariable } from './generation/constVariable.js';
import { constVariableWithDestructor } from './generation/constVariableWithDestructor.js';
import { objectAccessor } from './generation/objectAccessor.js';
import { tryCatchStatement } from './generation/tryCatchStatement.js';

// try {
//   const cheapDi = require('cheap-di');
//   const metadata = cheapDi.findOrCreateMetadata(<className>);
//   metadata.dependencies = [<parameters>];
// } catch (error: unknown) {
//   console.warn(error);
// }

export function createDependencyNodes(
  className: string,
  parameters: ClassConstructorParameter[],
  ids?: {
    findOrCreateMetadataFunc?: ts.Identifier;
    cheapDiIdentifier?: ts.Identifier;
  }
) {
  const parameterNodes = parameters.reduce(
    (_parameters, parameter) => {
      const unknown = () => {
        const unknownString = ts.factory.createStringLiteral('unknown');
        _parameters.expressions.push(unknownString);
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
            importedFrom: parameter.classReference.importedFrom,
            importType: parameter.classReference.importType,
          });
          return _parameters;
        }
      }

      return unknown();
    },
    {
      expressions: [] as ts.Expression[],
      imports: [] as (Omit<ImportedClass, 'classNameInImport'> & {
        identifier: ts.Identifier;
      })[],
    }
  );

  const cheapDiId = ts.factory.createIdentifier('cheapDi');

  return [
    tryCatchStatement([
      // const cheapDi = require('cheap-di');
      constVariable(cheapDiId, callFunction('require', ts.factory.createStringLiteral('cheap-di'))),

      // const metadata = cheapDi.findOrCreateMetadata(<className>);
      constVariable(
        'metadata',
        callFunction(
          // cheapDi.findOrCreateMetadata
          objectAccessor(cheapDiId).property('findOrCreateMetadata'),
          ts.factory.createIdentifier(className)
        )
      ),

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
    ]),
  ];
}
