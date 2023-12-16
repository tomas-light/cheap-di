import path from 'path';
import { Configuration } from 'webpack';
import { transformer } from 'cheap-di-ts-transform';
import { fileURLToPath } from 'url';

//we need to change up how __dirname is used for ES6 purposes
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageRoot = path.join(__dirname);
const tsconfig = path.join(packageRoot, 'tsconfig.json');

const config: Configuration = {
  mode: 'development',
  devtool: false,
  // target: 'web',
  entry: {
    case_01: path.join(packageRoot, 'src', 'case_01'),
  },
  output: {
    path: path.join(packageRoot, 'compiled'),
    publicPath: '/',
    // globalObject: 'this',
    globalObject: "typeof self !== 'undefined' ? self : this",
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
};

export default config;
