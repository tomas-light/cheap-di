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

  /**
   * add dependencies of dependencies right in place
   * @default false
   * @example
   * import { Repository } from './Repository';
   *
   * export class Service1 {
   *   constructor(private repository: Repository) {}
   *
   *   data() {
   *     return this.repository.users();
   *   }
   * }
   *
   * // deepRegistration: false
   * try {
   *   const cheapDi = await import('cheap-di');
   *   const { Repository } = await import('./Repository.ts');
   *   cheapDi.saveConstructorMetadata(Service1, Repository);
   * } catch (error) {
   *   console.warn(error);
   * }
   *
   * @example
   * import { Repository } from './Repository';
   *
   * export class Service1 {
   *   constructor(private repository: Repository) {}
   *
   *   data() {
   *     return this.repository.users();
   *   }
   * }
   *
   * // deepRegistration: true
   * try {
   *   const cheapDi = await import('cheap-di');
   *   const { Repository } = await import('./Repository.ts');
   *   cheapDi.saveConstructorMetadata(Service1, Repository);
   *   try {
   *     const { Logger } = await import('./Repository.ts');
   *     cheapDi.saveConstructorMetadata(Repository, Logger);
   *   } catch (error) {
   *     console.warn(error);
   *   }
   * } catch (error) {
   *   console.warn(error);
   * }
   * */
  deepRegistration: boolean;
};
