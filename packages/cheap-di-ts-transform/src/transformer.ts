import ts from 'typescript';
import { makeClassFinder } from './makeClassFinder.js';

type FactoryParameters = {
  program: ts.Program;
};

type TransformerFactory = (parameters: FactoryParameters) => ts.TransformerFactory<ts.SourceFile>;

export const transformer: TransformerFactory = (parameters) => {
  const { program } = parameters;
  const typeChecker = program.getTypeChecker();

  return (context) => {
    return (sourceFile) => {
      const { classFinder, ref } = makeClassFinder(context, typeChecker);

      const transformedSourceFile = ts.visitNode(sourceFile, (tsNode) => {
        return ts.visitEachChild(tsNode, classFinder, context);
      }) as ts.SourceFile;

      if (!ref.hasDependencies) {
        return transformedSourceFile;
      }

      return ts.factory.updateSourceFile(
        transformedSourceFile,
        transformedSourceFile.statements,
        transformedSourceFile.isDeclarationFile,
        transformedSourceFile.referencedFiles,
        transformedSourceFile.typeReferenceDirectives,
        transformedSourceFile.hasNoDefaultLib,
        transformedSourceFile.libReferenceDirectives
      );
    };
  };
};
