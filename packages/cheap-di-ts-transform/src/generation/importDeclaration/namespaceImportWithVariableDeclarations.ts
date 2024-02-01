import ts from 'typescript';
import { constVariableWithAliasAndDestructor } from '../constVariableWithAliasAndDestructor.js';

/**
 * generates default import declaration with passed package
 * @example
 * import * as packageName$_1 from 'package-name';
 * const { packageName: packageName_1 } = packageName$_1;
 * */
export function namespaceImportWithVariableDeclarations(
  params: { from: string; localHash: string },
  variables: {
    name: string;
    aliasName?: string;
  }[]
) {
  const { localHash, from } = params;

  const sanitizedFrom = from.replaceAll('.js', '').replaceAll(/[^a-zA-Z]/g, '');

  const from_snake_case = toSnakeCase(sanitizedFrom);

  const syntheticDefaultImportIdentifier = ts.factory.createIdentifier(from_snake_case + '_for_cheap_di_' + localHash);

  const importDeclarationNode = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, undefined, ts.factory.createNamespaceImport(syntheticDefaultImportIdentifier)),
    ts.factory.createStringLiteral(from),
    undefined
  );

  const variableIds = variables.map(({ name, aliasName }) => {
    const name_snake_case = toSnakeCase(name);
    const aliasName_snake_case = aliasName ? toSnakeCase(aliasName) : name_snake_case;

    const aliasIdentifier = ts.factory.createIdentifier(aliasName_snake_case + '_' + localHash);
    return {
      name: ts.factory.createIdentifier(name_snake_case),
      aliasName: aliasIdentifier,
    };
  });

  const variableStatementNode = constVariableWithAliasAndDestructor(variableIds, syntheticDefaultImportIdentifier);

  return {
    identifiers: variableIds.map((variable) => variable.aliasName),
    nodes: [importDeclarationNode, variableStatementNode] as const,
  };
}

function toSnakeCase(value: string) {
  let wasDash = false;

  return value.split('').reduce((name, char) => {
    if (char === '-') {
      wasDash = true;
      return name;
    }
    if (wasDash) {
      wasDash = false;
      return name + '_' + char.toUpperCase();
    }
    return name + char;
  }, '');
}
