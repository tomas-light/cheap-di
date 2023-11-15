import ts from 'typescript';
import { importDeclaration } from './generation/importDeclaration.js';
import { makeClassFinder } from './makeClassFinder.js';

export const transformer = (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
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
        [
          // import { findOrCreateMetadata } from 'cheap-di';
          importDeclaration('findOrCreateMetadata').from('cheap-di'),
          ...transformedSourceFile.statements,
        ],
        transformedSourceFile.isDeclarationFile,
        transformedSourceFile.referencedFiles,
        transformedSourceFile.typeReferenceDirectives,
        transformedSourceFile.hasNoDefaultLib,
        transformedSourceFile.libReferenceDirectives
      );
    };
  };
};
