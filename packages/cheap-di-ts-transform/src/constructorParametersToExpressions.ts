import {
  ClassConstructorParameter,
  ImportedClass,
  isClassParameter,
  isImportedClass,
  isLocalClass,
  isPrimitiveParameter,
} from './ClassConstructorParameter.js';
import ts from 'typescript';

type Import = Omit<ImportedClass, 'classNameInImport'> & {
  identifier: ts.Identifier;
};

export function constructorParametersToExpressions(parameters: ClassConstructorParameter[] | undefined) {
  const initial = {
    expressions: [] as ts.Expression[],
    imports: [] as Import[],
  };

  if (!parameters) {
    return initial;
  }

  return parameters.reduce((_parameters, parameter) => {
    const unknown = () => {
      const parameterName = !isClassParameter(parameter) ? parameter.name || '<no_name>' : '<no_name>';
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
