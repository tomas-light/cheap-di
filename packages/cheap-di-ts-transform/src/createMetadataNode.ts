import ts from 'typescript';
import { ClassConstructorParameter, isExistedImport } from './ClassConstructorParameter.js';
import { createIdentifierOfIdentifier } from './generation/createIdentifierOfIdentifier.js';
import { importDeclaration } from './generation/importDeclaration/index.js';

interface GeneratedNode {
  nameToDebug: string;
  node: ts.StringLiteral | ts.Identifier;
}

interface GeneratedImport extends GeneratedNode {
  from: string;
  importDeclarations: readonly [ts.ImportDeclaration, ts.VariableStatement];
}

export function isGeneratedImport(info: GeneratedNode | GeneratedImport): info is GeneratedImport {
  return (info as GeneratedImport).importDeclarations != null;
}

export function createMetadataNode(params: {
  typeChecker: ts.TypeChecker;
  parameter: ClassConstructorParameter;
  localHash: string;
}): (GeneratedNode | GeneratedImport) | undefined {
  const { typeChecker, parameter, localHash } = params;

  switch (true) {
    case parameter.type === 'unknown':
    case parameter.type === 'class' && parameter.importedClass == null: {
      const parameterName = parameter.name || '<no_name>';
      const unknownString = `unknown /${parameterName}/`;
      const unknownStringLiteral = ts.factory.createStringLiteral(unknownString);

      return {
        nameToDebug: unknownString,
        node: unknownStringLiteral,
      };
    }

    case parameter.type === 'primitive': {
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

      return {
        nameToDebug: primitiveString,
        node: primitiveStringLiteral,
      };
    }

    case parameter.type === 'class' && parameter.importedClass != null: {
      const { importedClass, name } = parameter;

      if (isExistedImport(importedClass)) {
        const newId = createIdentifierOfIdentifier(typeChecker, importedClass.existedId);
        return {
          nameToDebug: name ?? '<no_name>',
          node: newId,
        };
      }

      let classId: ts.Identifier;
      if (importedClass.namedAsClassId && importedClass.importType === 'named') {
        classId = importedClass.namedAsClassId;
      } else {
        classId = importedClass.classId;
      }

      const className = classId.getFullText().trim();

      switch (importedClass.importType) {
        case 'local defined': {
          return {
            nameToDebug: className,
            node: ts.factory.createIdentifier(className),
          };
        }

        case 'namespace':
        case 'named': {
          const { identifiers, nodes } = importDeclaration()
            .from(importedClass.importedFrom)
            .namespaceImportWithVariableDeclarations(localHash, [
              {
                name: className,
              },
            ]);

          // we declared only one variable here
          const [nodeIdentifier] = identifiers;

          return {
            nameToDebug: className,
            node: nodeIdentifier,
            importDeclarations: nodes,
            from: importedClass.importedFrom,
          };
        }

        case 'default': {
          const { identifiers, nodes } = importDeclaration()
            .from(importedClass.importedFrom)
            .namespaceImportWithVariableDeclarations(localHash, [
              {
                name: 'default',
                aliasName: className,
              },
            ]);

          // we declared only one variable here
          const [nodeIdentifier] = identifiers;

          return {
            nameToDebug: className,
            node: nodeIdentifier,
            importDeclarations: nodes,
            from: importedClass.importedFrom,
          };
        }

        default:
          ((unhandledValue: never) => {})(importedClass.importType);
          return undefined;
      }
    }
  }
}
