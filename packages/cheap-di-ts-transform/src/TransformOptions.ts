export type TransformOptions = {
  /**
   * gets node names if you want to debug transformation
   * @default false
   * */
  debug: boolean;

  /**
   * adds primitive types information of class parameters, to debug if there is something went wrong
   * @default false
   * */
  addDetailsToUnknownParameters: boolean;

  /**
   * adds console.debug call before saveConstructorMetadata function call. Useful to get debug information trace
   * @default false
   * */
  logRegisteredMetadata: boolean;

  /**
   * used in try-catch statements to log registration errors
   * @default 'warn'
   * */
  errorsLogLevel: keyof Pick<typeof console, 'debug' | 'log' | 'info' | 'warn' | 'error'>;

  /**
   * use `await import('package')` instead of `require('package')`. It works with top level await in esm
   * @default false
   * */
  esmImports: boolean;
};
