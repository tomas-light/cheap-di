import ts from 'typescript';
import { makeClassFinder } from './makeClassFinder.js';
import { TransformOptions } from './TransformOptions.js';
import { InternalTransformOptions } from './InternalTransformOptions.js';

type FactoryParameters = {
  program: ts.Program;
};

type TransformerFactory = (
  parameters: FactoryParameters,
  partialOptions?: Partial<TransformOptions>
) => ts.TransformerFactory<ts.SourceFile>;

export const transformer: TransformerFactory = (parameters, partialOptions: Partial<TransformOptions> = {}) => {
  const transformOptions: InternalTransformOptions = {
    debug: false,
    addDetailsToUnknownParameters: false,
    logRegisteredMetadata: false,
    errorsLogLevel: 'warn',
    esmImports: false,
    deepRegistration: false,
    // registeredClasses: new Set(),
    ...partialOptions,
  };

  let program: ts.Program;
  if ('getTypeChecker' in parameters && typeof parameters.getTypeChecker === 'function') {
    // when executing from ts-patch, it passes program directly
    program = parameters as unknown as ts.Program;
  } else {
    ({ program } = parameters);
  }

  const typeChecker = program.getTypeChecker();

  return (context) => {
    return (sourceFile) => {
      const { classFinder, ref } = makeClassFinder(context, typeChecker, transformOptions);

      const transformedSourceFile = ts.visitNode(sourceFile, (tsNode) => {
        const nodeText = transformOptions?.debug ? tsNode.getFullText() : '';
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
