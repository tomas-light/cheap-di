const cheapDiSymbol = dependenciesSymbol = Symbol('cheap-di metadata symbol');
const singletonSymbol = Symbol('cheap-di singleton');
const injectionSymbol = Symbol('cheap-di injection params');

const inheritancePreserveSymbol = Symbol('cheap-di injected constructor');

export {
  cheapDiSymbol,
  dependenciesSymbol,
  dependenciesSymbol as dependenciesSymbolCheapDI,
  singletonSymbol,
  injectionSymbol,
  inheritancePreserveSymbol,
};
