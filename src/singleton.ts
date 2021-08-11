import { singletonSymbol as singleton_s } from './symbols';

function singleton<TClass extends new(...args: any[]) => any>(constructor: TClass): TClass {
  (constructor as any)[singleton_s] = true;
  return constructor;
};

export { singleton };
