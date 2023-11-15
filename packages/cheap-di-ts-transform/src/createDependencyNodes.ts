import ts from 'typescript';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';
import { arrayExpression } from './generation/arrayExpression.js';
import { assignValue } from './generation/assignValue.js';
import { callFunction } from './generation/callFunction.js';
import { constVariable } from './generation/constVariable.js';
import { objectAccessor } from './generation/objectAccessor.js';
import { tryCatchStatement } from './generation/tryCatchStatement.js';

// try {
//   const metadata = findOrCreateMetadata(<className>);
//   metadata.dependencies = [<parameters>];
// } catch {}

export function createDependencyNodes(className: string, parameters: ClassConstructorParameter[]) {
  const parameterNodes = parameters.reduce((expressions, parameter) => {
    if (parameter.type === 'class' && parameter.classReferenceLocalName) {
      return expressions.concat(ts.factory.createIdentifier(parameter.classReferenceLocalName));
    }

    return expressions.concat(ts.factory.createStringLiteral('unknown'));
  }, [] as ts.Expression[]);

  return [
    tryCatchStatement([
      // const metadata = findOrCreateMetadata(<className>);
      constVariable(
        'metadata',

        // findOrCreateMetadata(<className>);
        callFunction('findOrCreateMetadata', ts.factory.createIdentifier(className))
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
