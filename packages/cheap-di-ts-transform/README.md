# cheap-di-ts-transform

Typescript code transformer. It produces constructor dependencies information to be able to use Dependency Injection approach with `cheap-di` package

```ts
abstract class Logger {
  abstract debug: (message: string) => void;
}

class Service {
  constructor(private logger: Logger) {}

  doSome() {
    this.logger.debug('Hello world!');
  }
}
/**
 * With cheap-di-ts-transform here will be added information about Service dependencies.
 * It will looks like:
 * @example
 * // for Logger
 * try {
 *   const cheapDi = require('cheap-di');
 *   const metadata = cheapDi.findOrCreateMetadata(Logger);
 *   metadata.dependencies = ["unknown"];
 * } catch (error: unknown) {
 *   console.warn(error);
 * }
 *
 * // for Service
 * try {
 *   const cheapDi = require('cheap-di');
 *   const metadata = cheapDi.findOrCreateMetadata(Service);
 *   metadata.dependencies = [Logger];
 * } catch (error: unknown) {
 *   console.warn(error);
 * }
 * */
```

## How to use

Webpack + ts-loader:
```ts
// webpack.config.ts
import path from 'path';
import { transformer } from 'cheap-di-ts-transform';

const tsconfigFilePath = path.join(__dirname, 'tsconfig.json');

const config = {
  // ...
  module: {
    rules: [
      // ...
      {
        loader: 'ts-loader',
        test: /\.ts$/,
        options: {
          getCustomTransformers: (program) => ({
            before: [transformer({ program })],
          }),
          configFile: tsconfigFilePath,
        },
      },
    ],
  },
};

export default config;
```