import { dependenciesSymbol } from './symbols';
import { Dependency, ImplementationType } from './types';

function inject<TClass extends new(...args: any[]) => any, TDependency extends Dependency>(dependency: TDependency) {
  return function (constructor: TClass, propertyKey: string | symbol, parameterIndex: number) {
    const implementation = constructor as ImplementationType<TClass>;
    if (!implementation[dependenciesSymbol]) {
      implementation[dependenciesSymbol] = [];
    }

    implementation[dependenciesSymbol]![parameterIndex] = dependency;
  };
}

export { inject };
