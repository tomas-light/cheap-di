/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/dependenciesTransformer/__tests/dependenciesSymbolCheapDI.ts":
/*!**************************************************************************!*\
  !*** ./src/dependenciesTransformer/__tests/dependenciesSymbolCheapDI.ts ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dependenciesSymbolCheapDI = void 0;
exports.dependenciesSymbolCheapDI = Symbol('cheap-di dependencies');


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!****************************************************************!*\
  !*** ./src/dependenciesTransformer/__tests/fileToTransform.ts ***!
  \****************************************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MyTest = exports.Abc = exports.TestClass = void 0;
const dependenciesSymbolCheapDI_1 = __webpack_require__(/*! ./dependenciesSymbolCheapDI */ "./src/dependenciesTransformer/__tests/dependenciesSymbolCheapDI.ts");
class TestClass {
    props;
}
exports.TestClass = TestClass;
class Abc {
    props;
}
exports.Abc = Abc;
class MyTest {
    test;
    constructor(localString, test, passedObject, abc) {
        this.test = test;
    }
    log() {
        console.log(this.test.props);
    }
}
exports.MyTest = MyTest;
try {
    if (!MyTest[Symbol.metadata]) {
        MyTest[Symbol.metadata] = {};
    }
    const metadata = (MyTest[Symbol.metadata]);
    if (!metadata[dependenciesSymbolCheapDI]) {
        metadata[dependenciesSymbolCheapDI] = [];
    }
    metadata[dependenciesSymbolCheapDI].push("unknown", TestClass, "unknown", Abc);
}
catch {
}

})();

/******/ })()
;