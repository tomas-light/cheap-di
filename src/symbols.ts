const dependenciesSymbol = Symbol('chip-di dependencies');
const singletonSymbol = Symbol('chip-di singleton');
const injectionSymbol = Symbol('chip-di injection params');

const inheritancePreserveSymbol = Symbol('cheap-di injected constructor');

export {
  dependenciesSymbol,
  singletonSymbol,
  injectionSymbol,
  inheritancePreserveSymbol,
};
