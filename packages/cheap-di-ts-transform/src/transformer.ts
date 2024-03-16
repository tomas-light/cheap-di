import ts from 'typescript';
import { makeClassFinder } from './makeClassFinder.js';
import { TransformOptions } from './TransformOptions.js';
import { InternalTransformOptions } from './InternalTransformOptions.js';
import { defined } from './defined.js';
import { mergeImportStatements } from './generation/mergeImportStatements.js';

type FactoryParameters = {
  program: ts.Program;
};

type TransformerFactory = (
  parameters: FactoryParameters,
  partialOptions?: Partial<TransformOptions>
) => ts.TransformerFactory<ts.SourceFile>;

export const transformer: TransformerFactory = (parameters, partialOptions = {}) => {
  const transformOptions: InternalTransformOptions = {
    debug: false,
    addDetailsToUnknownParameters: false,
    logRegisteredMetadata: false,
    errorsLogLevel: 'warn',
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
    let counter = 0;

    return (sourceFile) => {
      let localHash = (++counter).toString();

      let cheapDiMetadata: {
        /**
         * ID to use in saveMetadata (generated ID for new node or existing one in case of reusing)
         * @example
         * cheap-di ID
         *
         * @example
         * a class to save as dependency
         * */
        identifier?: ts.Identifier;

        /**
         * @example
         * import cheap_di_1 from 'cheap-di';
         * */
        generatedImportDeclaration?: ts.Statement;
      } = {};

      const generatedImportsMap = new Map<
        // where is import from
        string,
        /**
         * there multiple statements for each import
         * @example
         * import * as package_for_cheap_di_1 from 'package'; // ts.ImportDeclaration
         * const { A: A_1 } = package_for_cheap_di_1; // ts.VariableStatement
         * */
        ts.Statement[]
      >();

      const classFinder = makeClassFinder({
        context,
        typeChecker,
        options: transformOptions,
        localHash,
        generations: {
          getCheapDiIdentifier: () => cheapDiMetadata?.identifier,
          addCheapDi: (metadata) => {
            cheapDiMetadata = metadata;
          },
          addImport: (generatedImport) => {
            const existedStatements = generatedImportsMap.get(generatedImport.from);
            if (!existedStatements) {
              generatedImportsMap.set(generatedImport.from, generatedImport.nodes);
              return;
            }

            const merged = mergeImportStatements(existedStatements, generatedImport.nodes);
            generatedImportsMap.set(generatedImport.from, merged);
          },
        },
      });

      const transformedSourceFile = ts.visitNode(sourceFile, (tsNode) => {
        const nodeText = transformOptions?.debug ? tsNode.getFullText() : '';
        return ts.visitEachChild(tsNode, classFinder, context);
      }) as ts.SourceFile;

      const importStatements = [cheapDiMetadata?.generatedImportDeclaration]
        .concat(...generatedImportsMap.values())
        .filter(defined);

      const updated = ts.factory.updateSourceFile(
        sourceFile,
        importStatements.concat(transformedSourceFile.statements),
        transformedSourceFile.isDeclarationFile,
        transformedSourceFile.referencedFiles,
        transformedSourceFile.typeReferenceDirectives,
        transformedSourceFile.hasNoDefaultLib,
        transformedSourceFile.libReferenceDirectives
      );

      return updated;
    };
  };
};
