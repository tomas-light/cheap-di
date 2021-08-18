const dependenciesSymbol = Symbol('cheap-di dependencies');
const singletonSymbol = Symbol('cheap-di singleton');
const injectionSymbol = Symbol('cheap-di injection params');

const inheritancePreserveSymbol = Symbol('cheap-di injected constructor');

export {
  dependenciesSymbol,
  singletonSymbol,
  injectionSymbol,
  inheritancePreserveSymbol,
};
