function singleton<TClass extends new(...args: any[]) => any>() {
  return function(constructor: TClass): TClass {
    const decoratedConstructor = class extends constructor {
      static __singleton: boolean = true;
    };
    (decoratedConstructor as any).className = constructor.name;
    return decoratedConstructor;
  };
}

export { singleton };
