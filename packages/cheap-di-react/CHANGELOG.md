# Changelog

### 4.1.2

🔨 updated `cheap-di` to from `4.0.1` to `4.1.0`

### 4.1.1

🐛 Fixed singleton instantiating issue, when it was firstly instantiated in root container, and then instantiated again in one of child containers
🐛 Fixed possible issue with scoped singletons
🚧 Changed type of `DiContext`, not there is nullish type `DiContextType | null` to check if it has DiProvider or not

### 4.1.0

* updated cheap-di dependency to v4.0.0
* added prop `selfSingletons` as alias for `container.registerImplementation(...).asSingleton()`
* 🚧 DiOneTimeProvider was renamed to DIProviderMemo
```tsx
// before
<DIOneTimeProvider {/* ... */}>
  {/* ... */}
</DIOneTimeProvider>

// after
<DIProviderMemo {/* ... */}>
  {/* ... */}
</DIProviderMemo>
```
* 🚧 DiOneTimeProvider memoization logic was changed, now it compares passed `self` and `selfSingletons` items:
```tsx
const {
  dependencies,
  self,
  selfSingletons,
} = props;

// before
const memoizedDependencies = useMemo(() => dependencies, []);
const memoizedSelfDependencies = useMemo(() => self, []);
const memoizedSelfSingletons = useMemo(() => selfSingletons, []);

// after
const memoizedDependencies = useMemo(() => dependencies, []); // dependencies comparison not changed, because there are callbacks passed, that recreates on each render
const memoizedSelfDependencies = useMemo(() => self, [...(self ?? [])]);
const memoizedSelfSingletons = useMemo(() => selfSingletons, [...(selfSingletons ?? [])]);
```

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