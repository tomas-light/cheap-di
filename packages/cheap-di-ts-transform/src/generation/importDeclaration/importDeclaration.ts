import { namedImportDeclaration } from './namedImportDeclaration.js';
import { defaultImportDeclaration } from './defaultImportDeclaration.js';
import { namespaceImportWithVariableDeclarations } from './namespaceImportWithVariableDeclarations.js';

export type ImportName = {
  variableName: string;
  asAnotherName?: string;
};

/**
 * generates import declaration
 * @example
 * import packageName from 'package-name';
 * @example
 * import { your_variable1, variable2 as your_variable2 } from 'your-package-name';
 * */
export function importDeclaration() {
  return {
    from: (packageName: string) => {
      return {
        default: (importedName?: string) => defaultImportDeclaration(packageName, importedName),
        namespaceImportWithVariableDeclarations: (
          localHash: string,
          variables: Parameters<typeof namespaceImportWithVariableDeclarations>[1]
        ) =>
          namespaceImportWithVariableDeclarations(
            {
              localHash,
              from: packageName,
            },
            variables
          ),
        named: (names: ImportName[]) => namedImportDeclaration(packageName, names),
      };
    },
  };
}
