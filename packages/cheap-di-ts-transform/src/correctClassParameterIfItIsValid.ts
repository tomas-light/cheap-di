import ts from 'typescript';
import { ClassConstructorParameter, ClassParameter } from './ClassConstructorParameter.js';
import { findClassIdentifierSymbol } from './findClassIdentifierSymbol.js';

export function correctClassParameterIfItIsValid(parameters: {
  typeChecker: ts.TypeChecker;
  tsNode: ts.Node;
  outClassConstructorParameter: ClassConstructorParameter;
  currentImportFrom?: string;
  findClassConstructorParameters: (parameters: {
    classNode: ts.Node;
    currentImportFrom?: string;
    constructorParameters?: ClassConstructorParameter[];
  }) => ClassConstructorParameter[] | undefined;
}) {
  const {
    //
    typeChecker,
    tsNode,
    outClassConstructorParameter,
    currentImportFrom,
    findClassConstructorParameters,
  } = parameters;

  const classReference = findClassIdentifierSymbol(
    typeChecker,
    tsNode,
    currentImportFrom,
    findClassConstructorParameters
  );

  if (classReference) {
    const classParameter = outClassConstructorParameter as ClassParameter;
    classParameter.type = 'class';
    classParameter.classReference = classReference;
  }
}
