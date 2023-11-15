import path from 'path';
import { Configuration } from 'webpack';
import { transformer } from 'cheap-di-ts-transform';

const tsconfig = path.join(__dirname, '..', '..', 'tsconfig.test.json');

const config: Configuration = {
  mode: 'production',
  devtool: false,
  entry: {
    case_01: path.join(__dirname, 'src', 'case_01'),
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
          getCustomTransformers: (program: any) => ({
            before: [transformer(program)],
          }),
          configFile: tsconfig,
        },
      },
    ],
  },
};

export default config;
