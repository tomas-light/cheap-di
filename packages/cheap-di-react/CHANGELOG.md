# Changelog

### 4.1.0-rc-1

* updated cheap-di dependency to v4.0.0
* added prop `selfSingletons` as alias for `container.registerImplementation(...).asSingleton()`

### 4.0.2

Bugfixes:
* fixed crash for calling of `this.parentContainer.findRootContainer();` in `ReactContainer`;

### 4.0.1

Bugfixes:
* if `dependencies` is not provided, but provided `parentContainer`, we assume that Provider is configured;

### 4.0.0

BREAKING CHANGES:
* remove `stateful` decorator and `StatefulImplementation` - it is not a state management library, if you need so, please use Redux or similar;
* `useContainer` is renamed to `usDiContext` and added to export;
* `react` and `react-dom` version in `peerDependencies` are upgraded to version 17;

Features:
* `parentContainer`-prop is added to `DIProvider` to be able to add configured container in container chains. 
For example, you may have preconfigured container, and you want to be able to resolve dependencies in DOM
according to it;