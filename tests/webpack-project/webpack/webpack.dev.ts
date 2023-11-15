import path from 'path';
import { transformer } from 'cheap-di-ts-transform';

const packageRoot = path.join(__dirname, '..');
const tsconfig = path.join(packageRoot, 'tsconfig.json');

const config = {
  mode: 'development',
  devtool: false,
  entry: {
    case_01: path.join(packageRoot, 'src', 'case_01'),
  },
  output: {
    path: path.join(packageRoot, 'compiled'),
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        loader: 'ts-loader',
        test: /\.ts$/,
        options: {
          getCustomTransformers: (program) => ({
            before: [transformer(program)],
          }),
          configFile: tsconfig,
        },
      },
    ],
  },
};

module.exports = config;
