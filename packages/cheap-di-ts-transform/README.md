# cheap-di-ts-transform

* [What is it](#what-is-it)
* [How to use:](#how-to-use)
  * [Webpack + ts-loader](#ts-loader)
  * [ts-jest](#ts-jest)

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
/** cheap-di-ts-transform will add folowwing code:
 * @example
 * try {
 *   const cheapDi = require('cheap-di');
 *   cheapDi.saveConstructorMetadata(Service, Logger);
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
 * try {
 *   const cheapDi = require('cheap-di');
 *   cheapDi.saveConstructorMetadata(Example2, Service, "unknown", Example1, "unknown", Logger, "unknown", unknown, "unknown"); 
 * } catch (error: unknown) {
 *   console.warn(error);
 * }
 * */
```

in case when you use class from some package:
```ts
import { SomeClass } from 'some-package';

class Example3 {
  constructor(service: SomeClass) {}
}
/** cheap-di-ts-transform will add folowwing code:
 * @example
 * try {
 *   const cheapDi = require('cheap-di');
 *   const { SomeClass } = require('some-package');
 *   const metadata = cheapDi.saveConstructorMetadata(Example3, SomeClass);
 * } catch (error: unknown) {
 *   console.warn(error);
 * }
 * */
```

if imported class also used class in its constructor:
```ts
// "some-package"
// there are 3 files:
// SomeClass.ts, AnotherClass.ts, index.ts

// AnotherClass.ts
export class AnotherClass {}

// SomeClass.ts
import { AnotherClass } from './AnotherClass';

export class SomeClass {
  constructor(anotherClass: AnotherClass) {}
}

// index.ts
export * from './AnotherClass';
export * from './SomeClass';

// end of "some-package"

// your application
import { SomeClass } from 'some-package';

class Example3 {
  constructor(service: SomeClass) {}
}

/** cheap-di-ts-transform will add folowwing code:
 * @example
 * try {
 *  const cheapDi = require('cheap-di');
 *  const { SomeClass } = require('some-package');
 *  cheapDi.saveConstructorMetadata(Example3, SomeClass);
 *
 *  try {
 *    const { AnotherClass } = require('some-package');
 *    cheapDi.saveConstructorMetadata(SomeClass, AnotherClass);
 *  } catch (error: unknown) {
 *    console.warn(error);
 *  }
 * } catch (error: unknown) {
 *  console.warn(error);
 * }
 */
```
> Be careful. If you use dependencies from package, that use another depenedncies in this package, that are not exported from there. You will get an error during bundling with webpack.

```ts
// if "index.ts" in "some-package" from example above will look like:
export * from './SomeClass';
// and no export of AnotherClass

// you will get error during in bunlding time
```

## <a name="how-to-use"></a> How to use

### <a name="ts-loader"></a> Webpack + ts-loader:
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

### <a name="ts-jest"></a> ts-jest:
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