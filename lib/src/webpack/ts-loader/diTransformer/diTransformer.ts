import ts from 'typescript';
import { makeClassFinder } from './makeClassFinder';

export const diTransformer = (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
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
          // "import { cheapDiSymbol } from '@cheap-di/lib';"
          ts.factory.createImportDeclaration(
            undefined,
            ts.factory.createImportClause(
              false,
              undefined,
              ts.factory.createNamedImports([
                ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('cheapDiSymbol')),
              ])
            ),
            ts.factory.createStringLiteral('@cheap-di/lib')
          ),
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
