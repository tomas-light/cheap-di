import path from 'path';
import webpack, { Configuration } from 'webpack';
import { transformer } from 'cheap-di-ts-transform';
import { fileURLToPath } from 'url';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';

//we need to change up how __dirname is used for ES6 purposes
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageRoot = path.join(__dirname);
const tsconfig = path.join(packageRoot, 'tsconfig.json');

const config: Configuration & { devServer?: DevServerConfiguration } = {
  mode: 'development',
  devtool: 'source-map',
  // target: 'web',
  entry: path.join(packageRoot, 'src', 'index.tsx'),
  output: {
    path: path.join(packageRoot, 'compiled'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
      '.mjs': ['.mts', '.mjs'],
    },
  },
  module: {
    rules: [
      {
        loader: 'ts-loader',
        test: /\.tsx?$/,
        options: {
          getCustomTransformers: (program: any) => ({
            before: [
              transformer(
                { program },
                {
                  debug: true,
                  addDetailsToUnknownParameters: true,
                  logRegisteredMetadata: true,
                  errorsLogLevel: 'debug',
                  esmImports: true,
                }
              ),
            ],
          }),
          configFile: tsconfig,
        },
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(packageRoot, 'index.html'),
      inject: 'body',
    }),
  ],
};

export default config;
