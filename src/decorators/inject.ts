import { di } from "./di";
import { InheritancePreserver } from './InheritancePreserver';
import { dependenciesSymbol, injectionSymbol } from '../symbols';
import { Constructor, Dependency, ImplementationType, ImplementationTypeWithInjection } from '../types';

function inject<TClass extends Constructor, TDependency extends Dependency>(dependency: TDependency) {
  return function (constructor: TClass, propertyKey?: string | symbol, parameterIndex?: number) {
    const implementation = constructor as ImplementationType<TClass>;

    // if class inherited from another one the static property will contain the same array ref,
    // and we shouldn't change dependencies of base class
    const modifiedConstructor = InheritancePreserver.getModifiedConstructor(constructor);
    const injectInNewClass = modifiedConstructor !== constructor;

    if (!implementation[dependenciesSymbol] || injectInNewClass) {
      implementation[dependenciesSymbol] = [];
    }
    if (parameterIndex) {
      implementation[dependenciesSymbol]![parameterIndex] = dependency;
    }

    InheritancePreserver.constructorModified(constructor);
  };
}

function setInjectedParams<TInstance>(implementationType: ImplementationType<TInstance>, injectionParams: any[]) {
  (implementationType as ImplementationTypeWithInjection<TInstance>)[injectionSymbol] = injectionParams;
  InheritancePreserver.constructorModified(implementationType as Constructor);
}

function getInjectedParams<TClass extends Constructor>(constructor: TClass): any[] {
  const implementation = constructor as ImplementationTypeWithInjection<TClass>;
  const modifiedConstructor = InheritancePreserver.getModifiedConstructor(constructor);
  let injected = implementation[injectionSymbol];

  if (!modifiedConstructor) {
    di(constructor);
    InheritancePreserver.constructorModified(constructor);
    injected = implementation[injectionSymbol];
  }

  if (modifiedConstructor !== constructor || !Array.isArray(injected)) {
    return [];
  }

  return injected!;
}

export { inject, setInjectedParams, getInjectedParams };
