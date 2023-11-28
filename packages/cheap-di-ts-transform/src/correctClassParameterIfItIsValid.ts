import ts from 'typescript';
import { ClassConstructorParameter, ClassParameter } from './ClassConstructorParameter.js';
import { findClassIdentifierSymbol } from './findClassIdentifierSymbol.js';

export function correctClassParameterIfItIsValid(
  typeChecker: ts.TypeChecker,
  tsNode: ts.Node,
  outClassConstructorParameter: ClassConstructorParameter,
  findClassConstructorParameters: (
    classNode: ts.Node,
    constructorParameters?: ClassConstructorParameter[]
  ) => ClassConstructorParameter[] | undefined
) {
  const classReference = findClassIdentifierSymbol(typeChecker, tsNode, findClassConstructorParameters);

  if (classReference) {
    const classParameter = outClassConstructorParameter as ClassParameter;
    classParameter.type = 'class';
    classParameter.classReference = classReference;
  }
}
