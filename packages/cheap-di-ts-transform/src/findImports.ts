import ts, {
  type ImportClause,
  type ImportSpecifier,
  type NamedImports,
  // type NamespaceImport,
  type SyntaxList,
} from 'typescript';
import { ImportedClass } from './ClassConstructorParameter.js';

/**
 * @example
 * // namespace import
 * import * as package1 from 'package1';
 *
 * @example
 * // default import
 * import package1 from 'package1';
 *
 * @example
 * // named import
 * import { Foo } from 'package1';
 *
 * @example
 * // local defined is when there is no imports on desired class
 */
export type ImportType = 'default' | 'namespace' | 'named' | 'local defined';
// export type ImportValueType = 'type' | 'value';

export function findImports(sourceFile: ts.SourceFile) {
  const imports: ImportedClass[] = [];

  ts.forEachChild(sourceFile, (tsNode) => {
    const nodeText = tsNode.getFullText();
    if (!ts.isImportDeclaration(tsNode)) {
      return;
    }

    const children = tsNode.getChildren();

    const nameFromWhereImportIs = trimQuotesFromString(
      children.find((childNode) => ts.isStringLiteral(childNode))?.getFullText()
    );
    if (!nameFromWhereImportIs) {
      return;
    }

    const importClause = children.find((childNode) => ts.isImportClause(childNode)) as ImportClause | undefined;
    if (!importClause) {
      return;
    }

    const importChildren = importClause.getChildren();
    const defaultImportIdentifier = importChildren.find((node) => ts.isIdentifier(node)) as ts.Identifier | undefined;

    // let defaultImportValueType: ImportValueType = 'value';
    // if (importClause.isTypeOnly) {
    //   defaultImportValueType = 'type';
    // } else {
    //   const hasTypeKeyword = importChildren.some((node) => node.kind === ts.SyntaxKind.TypeKeyword);
    //   if (hasTypeKeyword) {
    //     defaultImportValueType = 'type';
    //   }
    // }

    // import A from 'a';
    // import type A from 'a';
    if (defaultImportIdentifier) {
      imports.push({
        classId: defaultImportIdentifier,
        namedAsClassId: undefined,
        importedFrom: nameFromWhereImportIs,
        importType: 'default',
        // importedAs: defaultImportValueType,
      });
    }

    // namespace import is
    // import * as package1 from 'package1';
    const namespaceImport = importChildren.find((node) => ts.isNamespaceImport(node)) as ts.NamespaceImport | undefined;
    if (namespaceImport) {
      const id = namespaceImport.getChildren().find((node) => ts.isIdentifier(node)) as ts.Identifier | undefined;
      if (id) {
        imports.push({
          classId: id,
          namedAsClassId: undefined,
          importedFrom: nameFromWhereImportIs,
          importType: 'namespace',
          // importedAs: defaultImportValueType,
        });
      }
      // there cannot be named import together with namespace import
      return;
    }

    const namedImports = importChildren.find((node) => ts.isNamedImports(node)) as NamedImports | undefined;
    if (!namedImports) {
      return;
    }

    const syntaxListNode = namedImports.getChildren().find((node) => node.kind === ts.SyntaxKind.SyntaxList) as
      | SyntaxList
      | undefined;
    if (!syntaxListNode) {
      return;
    }

    const importSpecifiers = syntaxListNode
      .getChildren()
      .filter((node) => ts.isImportSpecifier(node)) as ImportSpecifier[];
    if (!importSpecifiers.length) {
      return;
    }

    for (const specifier of importSpecifiers) {
      let classId: ts.Identifier | undefined = undefined;
      let namedAsClassId: ts.Identifier | undefined = undefined;
      let hasAsKeyword = false;
      // let hasTypeKeyword = false;

      for (const node of specifier.getChildren()) {
        if (ts.isIdentifier(node)) {
          if (hasAsKeyword) {
            namedAsClassId = node;
          } else {
            classId = node;
          }
        } else if (ts.isAssertsKeyword(node)) {
          hasAsKeyword = true;
        }
        // else if (node.kind === ts.SyntaxKind.TypeKeyword) {
        //   hasTypeKeyword = true;
        // }
      }

      if (classId) {
        imports.push({
          classId,
          namedAsClassId,
          // importedAs: hasTypeKeyword ? 'type' : 'value',
          importedFrom: nameFromWhereImportIs,
          importType: 'named',
        });
      }
    }
  });

  return imports;
}

// "'react'" => "react"
function trimQuotesFromString(importString: string | undefined) {
  if (!importString) {
    return importString;
  }

  importString = importString.trim();

  const SINGLE_QUOTE = "'";
  const DOUBLE_QUOTE = '"';

  const containsSingleQuotes =
    importString.indexOf(SINGLE_QUOTE) === 0 && importString.lastIndexOf(SINGLE_QUOTE) === importString.length - 1;

  const containsDoubleQuotes =
    importString.indexOf(DOUBLE_QUOTE) === 0 && importString.lastIndexOf(DOUBLE_QUOTE) === importString.length - 1;

  if (containsSingleQuotes || containsDoubleQuotes) {
    return importString.substring(1, importString.length - 1);
  }

  return importString;
}
