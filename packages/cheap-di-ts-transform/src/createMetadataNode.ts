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

  const parameterName = parameter.name || '<no_name>';

  switch (true) {
    case parameter.type === 'unknown':
    case parameter.type === 'class' && parameter.importedClass == null: {
      let id = '';
      if (parameter.type === 'unknown' && parameter.importedId) {
        // here may be an interface/type name
        id = ` :${parameter.importedId.getFullText().trim()}`;
      }

      const unknownString = `unknown /${parameterName}/${id}`;
      const unknownStringLiteral = ts.factory.createStringLiteral(unknownString);

      return {
        nameToDebug: unknownString,
        node: unknownStringLiteral,
      };
    }

    case parameter.type === 'primitive': {
      let primitiveString = `primitive /${parameterName}/ `;
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
          nameToDebug: `class /${parameterName}/ :${name}`,
          node: newId,
        };
      }

      let classId: ts.Identifier;
      if (importedClass.namedAsId && importedClass.importType === 'named') {
        classId = importedClass.namedAsId;
      } else {
        classId = importedClass.id;
      }

      const className = classId.getFullText().trim();
      const nameToDebug = `class /${parameterName}/ :${className}`;

      switch (importedClass.importType) {
        case 'local defined': {
          return {
            nameToDebug,
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
            nameToDebug,
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
            nameToDebug,
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
