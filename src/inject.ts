import { dependenciesSymbol, inheritancePreserveSymbol } from './symbols';
import { Dependency, ImplementationType } from './types';

function inject<TClass extends new(...args: any[]) => any, TDependency extends Dependency>(dependency: TDependency) {
  return function (constructor: TClass, propertyKey: string | symbol, parameterIndex: number) {
    const implementation = constructor as ImplementationType<TClass>;

    // if class inherited from another one the static property will be contain the same array ref,
    // and we shouldn't change dependencies of base class
    const lastInjectedConstructor = implementation[inheritancePreserveSymbol];
    const injectInNewClass = lastInjectedConstructor !== constructor;

    if (!implementation[dependenciesSymbol] || injectInNewClass) {
      implementation[dependenciesSymbol] = [];
    }
    implementation[dependenciesSymbol]![parameterIndex] = dependency;

    implementation[inheritancePreserveSymbol] = constructor;
  };
}

export { inject };
