# cheap-di-ts-transform

* [Installation](#installation)
* [What is it](#what-is-it)
* [How to use:](#how-to-use)
  * [Transform options](#options)
  * [Webpack + ts-loader](#ts-loader)
  * [ts-node](#ts-node)
  * [ts-jest](#ts-jest)
  * [Vite + @rollup/plugin-typescript](#vite)

## <a name="installation"></a> Installation

```shell
npm i cheap-di-ts-transform --save-dev
```

## <a name="what-is-it"></a> What is it

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
/** cheap-di-ts-transform will add folowing code:
 * @example
 * import cheap_di_1 from 'cheap-di';
 * try {
 *   cheap_di_1.saveConstructorMetadata(Service, Logger);
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
  // string (as well as any non-class parameters) will interpreted as 'unknown' dependency
  constructor(name: string) {}
}
/** cheap-di-ts-transform will add folowwing code:
 * @example
 * import cheap_di_1 from 'cheap-di';
 * try {
 *   cheapDi.saveConstructorMetadata(Example1, 'unknown');
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
 * import cheap_di_1 from 'cheap-di';
 * try {
 *   cheapDi.saveConstructorMetadata(Example2, Service, "unknown", Example1, "unknown", Logger, "unknown", unknown, "unknown");
 * } catch (error: unknown) {
 *   console.warn(error);
 * }
 * */
```

in case when you import class from somewhere:
```ts
import { SomeClass } from 'some-package';
/** cheap-di-ts-transform will add folowwing code:
 * @example
 * import cheap_di_1 from 'cheap-di';
 * import * as some_package_for_cheap_di_1 from 'some-package';
 * const { SomeClass: SomeClass_1 } = some_package_for_cheap_di_1;
 * */

class Example3 {
  constructor(service: SomeClass) {}
}
/** cheap-di-ts-transform will add folowwing code:
 * @example
 * try {
 *   cheap_di_1.saveConstructorMetadata(Example3, SomeClass_1);
 * } catch (error: unknown) {
 *   console.warn(error);
 * }
 * */
```

## <a name="how-to-use"></a> How to use

### <a name="options"></a> Transform options
| name                           | value by default | description                                                                                                                                                                          |
|--------------------------------|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| debug                          | `false`          | gets node names if you want to debug transformation                                                                                                                                  |
| addDetailsToUnknownParameters  | `false`          | adds primitive types information of class parameters, to debug if something went wrong, instead of just `unknown` you will get something like `primitive /<parameter-name>/ :string` |
| logRegisteredMetadata          | `false`          | adds console.debug call before saveConstructorMetadata function call. Useful to get debug information traced. You will see this information at runtime in console                    |
| errorsLogLevel                 | `"warn"`         | used in try-catch statements to log registration errors                                                                                                                              |

### <a name="ts-loader"></a> Webpack + ts-loader

> [!WARNING]
> The transformer does not work properly when used together with `fork-ts-checker-webpack-plugin`.
> If you have any thoughts on why is it and/or how we can fix it, please open the issue with details.

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
            before: [
              transformer(
                { program },
                {
                  // options are optional
                  debug: false,
                  addDetailsToUnknownParameters: false,
                  logRegisteredMetadata: false,
                  errorsLogLevel: "warn",
                }
              ),
            ],
          }),
          configFile: tsconfigFilePath,
        },
      },
    ],
  },
};

export default config;
```

### <a name="ts-node"></a> ts-node
You may use the transformer in nodejs, but in this case you need to use a compiler like `ts-patch`.

tsconfig.json
```json
{
  "compilerOptions": {
    // [...]
    "plugins": [
      {
        "transform": "cheap-di-ts-transform",
        // all options are optional
        "debug": false,
        "addDetailsToUnknownParameters": false,
        "logRegisteredMetadata": false,
        "errorsLogLevel": "warn",
      }
    ]
  },
  "ts-node": {
    "compiler": "ts-patch/compiler"
  }
}
```

### <a name="ts-jest"></a> ts-jest
```json
{
  // [...]
  "transform": {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        "astTransformers": {
          "before": [
            {
              "path": "cheap-di-ts-transform",
              // all options are optional
              "options": {
                "debug": false,
                "addDetailsToUnknownParameters": false,
                "logRegisteredMetadata": false,
                "errorsLogLevel": "warn",
              }
            }
          ]
        }
      }
    ]
  }
}
```

### <a name="vite"></a> Vite + @rollup/plugin-typescript
```ts
// vite.config.ts
import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';
import { transformer } from 'cheap-di-ts-transform';

export default defineConfig({
  plugins: [
    // ...
    typescript({
      transformers: {
        before: [
          {
            type: 'program',
            factory: (program) =>
              transformer(
                { program },
                {
                  // (optional) debugging options
                  debug: true,
                  addDetailsToUnknownParameters: true,
                  logRegisteredMetadata: true,
                  errorsLogLevel: 'debug',
                }
              ),
          },
        ],
      },
    }),
  ],
});
```

### Helpful links

* <a href="https://ts-ast-viewer.com/">TypeScript AST Viewer</a>