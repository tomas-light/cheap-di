import tsCreator from 'ts-creator';
import ts from 'typescript';
import {
  ClassConstructorParameter,
  isClassParameter,
  isImportedClass,
  isLocalClass,
} from '../ClassConstructorParameter.js';

// const classLocalName = 'MyService';
//
// const parameters: ClassConstructorParameter[] = [
//   {
//     type: 'unknown',
//   },
//   {
//     type: 'class',
//     classReference: {
//       localName: 'MyAbstractionClass',
//     },
//   },
// ];
//
// const parametersToArrayItems = parameters.reduce((sourceString, parameter) => {
//   const fallback = () => {
//     if (sourceString) {
//       return sourceString + `, "${parameter.type}"`;
//     }
//
//     return `"${parameter.type}"`;
//   };
//
//   if (isClassParameter(parameter)) {
//     if (!parameter.classReference) {
//       return fallback();
//     }
//
//     if (isLocalClass(parameter.classReference)) {
//       if (sourceString) {
//         return sourceString + `, ${parameter.classReference.localName}`;
//       }
//       return parameter.classReference.localName;
//     }
//
//     if (isImportedClass(parameter.classReference)) {
//       const id = ts.factory.createIdentifier(parameter.classReference.classNameInImport);
//       _parameters.expressions.push(id);
//       _parameters.imports.push({
//         identifier: id,
//         importedFrom: parameter.classReference.importedFrom,
//         importType: parameter.classReference.importType,
//       });
//       return _parameters;
//     }
//   }
//
//   return fallback();
// }, '');
//
// const code1 = `\
// try {
//   import { findOrCreateMetadata } from 'cheap-di';
//   const metadata = findOrCreateMetadata(${classLocalName});
//   metadata.dependencies = [${parametersToArrayItems}];
// } catch {}\
//     `;
//
// const code2 = `\
// try {
//   import cheapDi from 'cheap-di';
//   const metadata = cheapDi.findOrCreateMetadata(${classLocalName});
//   metadata.dependencies = [${parametersToArrayItems}];
// } catch {}\
//     `;

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

const code5 = `\    
const { Class } = require('react');\
    `;

const nodeGenerationCode = tsCreator(code5);
console.log(nodeGenerationCode);
