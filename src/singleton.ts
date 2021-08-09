import { singletonSymbol as singleton_s } from './symbols';

function singleton<TClass extends new(...args: any[]) => any>() {
  return function(constructor: TClass): TClass {
    const decoratedConstructor = class extends constructor {
      static [singleton_s]: boolean = true;
    };
    (decoratedConstructor as any).className = constructor.name;
    return decoratedConstructor;
  };
}

export { singleton };
