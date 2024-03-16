import ts, { SyntaxKind } from 'typescript';
import { constVariableWithAliasAndDestructor } from './constVariableWithAliasAndDestructor.js';

/**
 * merge two declarations to prevent duplications
 * @example
 * import * as package_1 from 'package'; // ts.ImportDeclaration
 * const { A: A_1 } = package_1; // ts.VariableStatement
 *
 * // plus
 * import * as package_1 from 'package'; // ts.ImportDeclaration
 * const { B: B_1 } = package_1; // ts.VariableStatement
 *
 * // should became
 * import * as package_1 from 'package'; // ts.ImportDeclaration
 * const { A: A_1, B: B_1 } = package_1; // ts.VariableStatement
 *
 * @example
 * // NOT IMPLEMENTED
 *
 * import DefaultExported from 'package1';
 * // and
 * import { Bar } from 'package1';
 * // should became
 * import DefaultExported, { Bar } from 'package1';
 * */
export function mergeImportStatements(leftStatements: ts.Statement[], rightStatements: ts.Statement[]): ts.Statement[] {
  const _importDeclaration = (leftStatements.find((statement) => ts.isImportDeclaration(statement)) ??
    rightStatements.find((statement) => ts.isImportDeclaration(statement))) as ts.DeclarationStatement | undefined;

  if (!_importDeclaration) {
    // check just in case, should not happen
    return leftStatements.concat(rightStatements);
  }

  // Node without a real position cannot be scanned and thus has no token nodes - use forEachChild and collect the result if that's fine
  // const importIdentifier = _importDeclaration
  //   .getChildren()
  //   .find((node) => ts.isImportClause(node))
  //   ?.getChildren()
  //   .find((node) => ts.isNamespaceImport(node))
  //   ?.getChildren()
  //   .find((node) => ts.isIdentifier(node)) as ts.Identifier | undefined;
  let importIdentifier: ts.Identifier | undefined;
  _importDeclaration.forEachChild((node) => {
    if (!ts.isImportClause(node)) {
      return;
    }
    node.forEachChild((node2) => {
      if (!ts.isNamespaceImport(node2)) {
        return;
      }
      node2.forEachChild((node3) => {
        if (ts.isIdentifier(node3)) {
          importIdentifier = node3;
        }
      });
    });
  });

  if (!importIdentifier) {
    // check just in case, should not happen
    return leftStatements.concat(rightStatements);
  }

  const leftVariables = leftStatements.filter((statement) => ts.isVariableStatement(statement));
  const rightVariables = rightStatements.filter((statement) => ts.isVariableStatement(statement));

  const aliases = new Set<string>();

  const variableIds = leftVariables.concat(rightVariables).reduce(
    (ids, statement) => {
      // Node without a real position cannot be scanned and thus has no token nodes - use forEachChild and collect the result if that's fine
      // const nameNodes = statement
      //   .getChildren()
      //   .find((node) => ts.isVariableDeclarationList(node))
      //   ?.getChildren()
      //   .find((node) => node.kind === SyntaxKind.SyntaxList)
      //   ?.getChildren()
      //   .find((node) => ts.isVariableDeclaration(node))
      //   ?.getChildren()
      //   .find((node) => ts.isObjectBindingPattern(node))
      //   ?.getChildren()
      //   .find((node) => node.kind === SyntaxKind.SyntaxList)
      //   ?.getChildren()
      //   .filter((node) => ts.isBindingElement(node))
      //   .map((node) => node.getChildren());
      // nameNodes?.forEach(([name, colonToken, aliasName]) => {
      //   if (!name || !aliasName) {
      //     return;
      //   }
      //   if (!ts.isIdentifier(name) || !ts.isIdentifier(aliasName)) {
      //     return;
      //   }
      //   ids.push({
      //     name,
      //     aliasName,
      //   });
      // });
      statement.forEachChild((node) => {
        if (!ts.isVariableDeclarationList(node)) {
          return;
        }
        node.forEachChild((node2) => {
          if (!ts.isVariableDeclaration(node2)) {
            return;
          }
          node2.forEachChild((node3) => {
            if (!ts.isObjectBindingPattern(node3)) {
              return;
            }
            node3.forEachChild((node4) => {
              if (!ts.isBindingElement(node4)) {
                return;
              }

              const nodes: ts.Identifier[] = [];

              node4.forEachChild((node5) => {
                if (ts.isIdentifier(node5)) {
                  nodes.push(node5);
                }
              });

              if (nodes.length === 2) {
                const [name, aliasName] = nodes;

                if (aliases.has(aliasName.text)) {
                  return;
                }
                aliases.add(aliasName.text);

                ids.push({
                  name,
                  aliasName,
                });
              }
            });
          });
        });
      });

      return ids;
    },
    [] as { name: ts.Identifier; aliasName: ts.Identifier }[]
  );

  const mergedStatements: ts.Statement[] = [_importDeclaration];

  const newVariableStatementNode = constVariableWithAliasAndDestructor(variableIds, importIdentifier);
  mergedStatements.push(newVariableStatementNode);

  return mergedStatements;
}
