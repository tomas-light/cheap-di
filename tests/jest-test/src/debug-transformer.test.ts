import { stat } from 'fs/promises';
import path from 'path';
import ts from 'typescript';
import { transformer } from 'cheap-di-ts-transform';
// import { fileURLToPath } from 'url';
// import tsconfig from '../tsconfig.json';

test.skip('debug-transformer', async () => {
  // const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const filePath = path.join(__dirname, 'test-file.ts');

  const { options: compilerOptions } = ts.convertCompilerOptionsFromJson(/*tsconfig.compilerOptions*/ {}, '.');

  const fileStats = await stat(filePath);
  if (!fileStats.isFile()) {
    throw new Error(`file not found for path (${filePath})`);
  }

  const host = ts.createCompilerHost(compilerOptions);
  const program = ts.createProgram({
    host,
    options: compilerOptions,
    rootNames: [filePath],
  });

  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) {
    throw new Error(`we can not to make SourceFile from a file (${filePath})`);
  }

  program.emit(undefined, undefined, undefined, undefined, {
    before: [transformer({ program })],
  });
});
