import tsCreator from 'ts-creator';
import { ClassConstructorParameter } from '../ClassConstructorParameter.js';

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

const code1 = `\    
try {
  import { findOrCreateMetadata } from 'cheap-di';
  const metadata = findOrCreateMetadata(${classLocalName});
  metadata.dependencies = [${parametersToArrayItems}];
} catch {}\
    `;

const code2 = `\    
try {
  import cheapDi from 'cheap-di';
  const metadata = cheapDi.findOrCreateMetadata(${classLocalName});
  metadata.dependencies = [${parametersToArrayItems}];
} catch {}\
    `;

const code3 = `\    
try {
  import ('cheap-di').then((module) => {
    try {
      const metadata = module.findOrCreateMetadata(Service);
      metadata.dependencies = [Logger];
    } catch (error: unknown) {
      console.warn(error);
    }
  });
} catch (error: unknown) {
  console.warn(error);
}\
    `;

const code4 = `\    
try {
  const cheapDi = require('cheap-di');
  const metadata = cheapDi.findOrCreateMetadata(Service);
  metadata.dependencies = [Logger];
} catch (error) {
  console.warn(error);
}\
    `;

const nodeGenerationCode = tsCreator(code4);
console.log(nodeGenerationCode);
