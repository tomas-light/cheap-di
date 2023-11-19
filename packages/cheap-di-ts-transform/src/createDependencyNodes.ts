import ts from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';
import { arrayExpression } from './generation/arrayExpression.js';
import { assignValue } from './generation/assignValue.js';
import { callFunction } from './generation/callFunction.js';
import { constVariable } from './generation/constVariable.js';
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
  const parameterNodes = parameters.reduce((expressions, parameter) => {
    if (parameter.type === 'class' && parameter.classReferenceLocalName) {
      return expressions.concat(ts.factory.createIdentifier(parameter.classReferenceLocalName));
    }

    return expressions.concat(ts.factory.createStringLiteral('unknown'));
  }, [] as ts.Expression[]);

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

      // metadata.dependencies = [<parameters>];
      assignValue(
        // metadata.dependencies
        objectAccessor('metadata').property('dependencies')
      ).value(
        // [<parameters>]
        arrayExpression(...parameterNodes)
      ),
    ]),
  ];
}
