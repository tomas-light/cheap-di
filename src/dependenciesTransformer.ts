import tsCreator from 'ts-creator';
import ts from 'typescript';

const transformerProgram = (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
  const typeChecker = program.getTypeChecker();

  return (context) => {
    return (sourceFile) => {
      const { dependencyRegistrationNodes, classFinder } = makeClassFinder(context, typeChecker);

      ts.visitNode(sourceFile, (tsNode) => {
        return ts.visitEachChild(tsNode, classFinder, context);
      });

      if (!dependencyRegistrationNodes.length) {
        return sourceFile;
      }

      // import { dependenciesSymbolCheapDI } from 'cheap-di';
      const updatedSourceFile = ts.updateSourceFileNode(sourceFile, [
        ts.createImportDeclaration(
          /* decorators */ undefined,
          /* modifiers */ undefined,
          ts.createImportClause(
            // ts.createIdentifier('DefaultImport'),
            ts.createNamedImports([
              ts.createImportSpecifier(undefined, ts.createIdentifier('dependenciesSymbolCheapDI')),
            ])
          ),
          ts.createLiteral('cheap-di')
        ),
        // Ensures the rest of the source files statements are still defined.
        ...sourceFile.statements,
      ]);

      return updatedSourceFile;
    };
  };
};

function makeClassFinder(context: ts.TransformationContext, typeChecker: ts.TypeChecker) {
  const dependencyRegistrationNodes: ts.ExpressionStatement[] = [];

  function classFinder(tsNode: ts.Node): ts.Node {
    if (!ts.isClassDeclaration(tsNode)) {
      return ts.visitEachChild(tsNode, classFinder, context);
    }

    const classDeclarationNode = tsNode;

    const {
      ref: { classLocalName, parameters },
      constructorFinder,
    } = makeConstructorFinder(context, typeChecker);

    ts.visitEachChild(classDeclarationNode, constructorFinder, context);

    if (!classLocalName || !parameters.length) {
      return classDeclarationNode;
    }

    const parametersToArrayItems = parameters.reduce((sourceString, parameter) => {
      if (parameter.type === 'class' && parameter.classReferenceLocalName) {
        if (sourceString) {
          return sourceString + `, ${parameter.classReferenceLocalName}`;
        }

        return parameter.classReferenceLocalName;
      }

      if (sourceString) {
        return sourceString + `, "${parameter.type}"`;
      }

      return `"${parameter.type}"`;
    }, '');

    const generatedCode = tsCreator(`\
(((${classLocalName}[Symbol.metadata] ??= {})[dependenciesSymbolCheapDI] ??= []) as any[]).push(${parametersToArrayItems});
`) as unknown as ts.ExpressionStatement;

    dependencyRegistrationNodes.push(generatedCode);

    return classDeclarationNode;
  }

  return {
    dependencyRegistrationNodes,
    classFinder,
  };
}

type ClassConstructorParameter = {
  type: 'class' | 'unknown';
  classReferenceLocalName?: string;
};

function makeConstructorFinder(context: ts.TransformationContext, typeChecker: ts.TypeChecker) {
  const ref = {
    classLocalName: undefined as string | undefined,
    parameters: [] as ClassConstructorParameter[],
  };

  function constructorFinder(classNode: ts.Node): ts.Node {
    if (ts.isIdentifier(classNode)) {
      const identifierSymbol = typeChecker.getSymbolAtLocation(classNode);
      ref.classLocalName = identifierSymbol?.escapedName.toString();
      return classNode;
    } else if (!ts.isConstructorDeclaration(classNode)) {
      return ts.visitEachChild(classNode, constructorFinder, context);
    }

    const constructorDeclaration: ts.ConstructorDeclaration = classNode;

    const parameterDeclarations: ts.ParameterDeclaration[] = [];
    constructorDeclaration.forEachChild((node) => {
      if (ts.isParameter(node)) {
        parameterDeclarations.push(node);
      }
    });

    for (const parameterDeclaration of parameterDeclarations) {
      const parameter: ClassConstructorParameter = {
        type: 'unknown',
      };
      ref.parameters.push(parameter);

      parameterDeclaration.forEachChild((parameterNode) => {
        if (parameterNode.kind !== ts.SyntaxKind.TypeReference) {
          return;
        }

        let identifierSymbol: ts.Symbol | undefined;
        for (const nodeChild of parameterNode.getChildren()) {
          if (ts.isIdentifier(nodeChild)) {
            identifierSymbol = typeChecker.getSymbolAtLocation(nodeChild);
            break;
          }
        }

        if (!identifierSymbol) {
          return;
        }

        const symbolDeclarations = identifierSymbol.getDeclarations();
        if (!symbolDeclarations?.length) {
          return;
        }

        let isClass = false;
        let parameterClassDeclaration: ts.ClassDeclaration | undefined;

        for (const declaration of symbolDeclarations) {
          if (ts.isClassDeclaration(declaration)) {
            isClass = true;
            parameterClassDeclaration = declaration;
            break;
          }
        }

        if (isClass) {
          parameter.type = 'class';
          parameter.classReferenceLocalName = identifierSymbol.escapedName.toString();
        }
      });
    }

    console.log(
      '[my-transformer]',
      `\t(${ref.classLocalName}) parameters: [${JSON.stringify(ref.parameters, null, 2)}]`
    );

    return classNode;
  }

  return {
    ref,
    constructorFinder,
  };
}

export default transformerProgram;
