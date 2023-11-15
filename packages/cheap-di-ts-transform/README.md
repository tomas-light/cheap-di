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
 *   import { findOrCreateMetadata } from 'cheap-di';
 *   
 *   const metadata = findOrCreateMetadata(Logger);
 *   
 *   // only classes may be instantiated with DI, other parameters can be filled with argument injection
 *   metadata.dependencies = ["unknown"];
 * } catch {}
 *
 * // for Service
 * try {
 *   import { cheapDiSymbol, findOrCreateMetadata } from 'cheap-di';
 *   
 *   const metadata = findOrCreateMetadata(Service);
 *   
 *   metadata.dependencies = [Logger];
 * } catch {}
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
            before: [transformer(program)],
          }),
          configFile: tsconfigFilePath,
        },
      },
    ],
  },
};

export default config;
```