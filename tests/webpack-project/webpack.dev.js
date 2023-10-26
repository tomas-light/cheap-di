const path = require('path');
const { cheapDiWebpackPlugin } = require('@cheap-di/lib');

const tsconfig = path.join(__dirname, '..', '..', 'tsconfig.test.json');

const config = {
  mode: 'development',
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
          getCustomTransformers: (program) => ({
            before: [cheapDiWebpackPlugin(program)],
          }),
          configFile: tsconfig,
        },
      },
    ],
  },
};

module.exports = config;
