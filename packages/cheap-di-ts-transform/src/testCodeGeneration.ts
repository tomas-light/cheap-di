import tsCreator from 'ts-creator';
import { ClassConstructorParameter } from './ClassConstructorParameter.js';

const classLocalName = 'MyService';

const parameters: ClassConstructorParameter[] = [
  {
    type: 'unknown',
  },
  {
    type: 'class',
    classReferenceLocalName: 'MyAbstractionClass',
  },
];

const parametersToArrayItems = parameters.reduce((sourceString, parameter) => {
  if (parameter.type === 'class' && parameter.classReferenceLocalName) {
    if (sourceString) {
      return sourceString + `, ${parameter.classReferenceLocalName}`;
    }

    return parameter.classReferenceLocalName;
  }

  if (sourceString) {
    return sourceString + `, "${parameter.type}"`;
  }

  return `"${parameter.type}"`;
}, '');

const code = `\    
try {
  import { findOrCreateMetadata } from 'cheap-di';
  const metadata = findOrCreateMetadata(${classLocalName});
  metadata.dependencies = [${parametersToArrayItems}];
} catch {}\
    `;

const nodeGenerationCode = tsCreator(code);
debugger;
