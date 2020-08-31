"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.container = void 0;
var dependencies = new Map();
function makeInstance(instanceType, args) {
    var implementation = dependencies.get(instanceType);
    if (typeof implementation !== "function") {
        return implementation;
    }
    var injectionParams = implementation.__injectionParams || [];
    return new (implementation.bind.apply(implementation, __spreadArrays([void 0], __spreadArrays(injectionParams, args))))();
}
var container = {
    registerType: function (implementationType) {
        return {
            as: function (instanceType) {
                if (dependencies.has(instanceType)) {
                    throw new Error("The instance type (" + instanceType.name + ") is already registered");
                }
                dependencies.set(instanceType, implementationType);
                return {
                    "with": function () {
                        var injectionParams = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            injectionParams[_i] = arguments[_i];
                        }
                        implementationType.__injectionParams = injectionParams;
                    }
                };
            }
        };
    },
    registerInstance: function (instance) {
        return {
            as: function (instanceType) {
                if (dependencies.has(instanceType)) {
                    throw new Error("The instance type (" + instanceType.name + ") is already registered");
                }
                dependencies.set(instanceType, instance);
            }
        };
    },
    resolve: function (instanceType) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (dependencies.has(instanceType)) {
            return makeInstance(instanceType, args);
        }
        if (!instanceType.__constructorParams || !Array.isArray(instanceType.__constructorParams)) {
            throw new Error("The " + instanceType.name + " cannot be resolved by Dependency Injection");
        }
        var dependencyArguments = [];
        instanceType.__constructorParams.forEach(function (type) {
            var instance = container.resolve(type);
            dependencyArguments.push(instance);
        });
        return new (instanceType.bind.apply(instanceType, __spreadArrays([void 0], __spreadArrays(dependencyArguments, args))))();
    }
};
exports.container = container;
