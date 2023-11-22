# cheap-di-ts-transform

Typescript code transformer. It produces constructor dependencies information to be able to use Dependency Injection approach with `cheap-di` package

```ts
// no constructors => no depdendencies
abstract class Logger {
  abstract debug: (message: string) => void;
}


// no constructors => no depdendencies
class ConsoleLogger extends Logger {
  debug(message: string) {
    console.log(message);
  }
}


// has constructor => has depdendencies => leads to code generation 
class Service {
  constructor(public logger: Logger) {}

  doSome() {
    this.logger.debug('Hello world!');
  }
}
/** cheap-di-ts-transform will add folowwing code:
 * @example
 * try {
 *   const cheapDi = require('cheap-di');
 *   const metadata = cheapDi.findOrCreateMetadata(Service);
 *   metadata.dependencies = [Logger];
 * } catch (error: unknown) {
 *   console.warn(error);
 * }
 * */

// somewhere
import { container } from 'cheap-di';

container.registerImplementation(ConsoleLogger).as(Logger);

const service = container.resolve(Service);
console.log(service instanceof Service); // true
console.log(service.logger instanceof ConsoleLogger); // true
console.log(service.doSome()); // 'Hello world!'
```
more examples:
```ts
// no constructors => no depdendencies
class JustSomeClass {}


class Example1 {
  // string (as well as any non-class parameters) will interpreted as 'unknown' depdency
  constructor(name: string) {} 
}
/** cheap-di-ts-transform will add folowwing code:
 * @example
 * try {
 *   const cheapDi = require('cheap-di');
 *   const metadata = cheapDi.findOrCreateMetadata(Example1);
 *   metadata.dependencies = ['unknown'];
 * } catch (error: unknown) {
 *   console.warn(error);
 * }
 * */


interface MyInterface {
  //
}

class Example2 {
  constructor(
    service: Service,
    some: number, // 'unknown'
    example1: Example1,
    foo: boolean, // 'unknown'
    logger: Logger,
    bar: { data: any }, // 'unknown'
    callback: () => void, // 'unknown'
    myInterface: MyInterface  // 'unknown'
  ) {} 
}
/** cheap-di-ts-transform will add folowwing code:
 * @example
 * try {
 *   const cheapDi = require('cheap-di');
 *   const metadata = cheapDi.findOrCreateMetadata(Example2);
 *   metadata.dependencies = [Service, "unknown", Example1, "unknown", Logger, "unknown", unknown, "unknown"] 
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

ts-jest:
```json
{
  // [...]
  "transform": {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        "astTransformers": {
           "before": ["cheap-di-ts-transform"]
        }
      }
    ]
  }
}

```