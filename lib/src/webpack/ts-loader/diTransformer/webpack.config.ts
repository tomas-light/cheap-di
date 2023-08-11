import path from 'path';
import ts from 'typescript';
import { Configuration } from 'webpack';
import { diTransformer } from './diTransformer';

const testDirectory = path.join(__dirname, '__tests');
const tsconfig = path.join(__dirname, '..', '..', 'tsconfig.test.json');

const config: Configuration = {
  mode: 'development',
  devtool: false,
  entry: {
    fileToTransform: path.join(testDirectory, 'fileToTransform.ts'),
  },
  output: {
    path: path.join(__dirname, 'compiled'),
  },
  resolve: {
    extensions: ['.ts'],
  },
  module: {
    rules: [
      {
        loader: 'ts-loader',
        test: /\.ts$/,
        options: {
          getCustomTransformers: (program: ts.Program) => ({
            before: [diTransformer(program)],
            // after: [yourAfterTransformer(program, { customConfig: true })],
          }),
          configFile: tsconfig,
        },
      },
    ],
  },
  optimization: {
    minimize: false,
    chunkIds: false,
    mangleExports: false,
    sideEffects: true,
  },
};

export default config;
