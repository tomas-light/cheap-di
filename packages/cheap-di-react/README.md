# cheap-di-react
Integration of cheap-di into React via React.context

## How to use

There is simple logger.
```ts
// logger.ts
export abstract class Logger {
  abstract debug(message: string): void;
}

export class SimpleConsoleLogger extends Logger {
  debug(message: string) {
    console.log(message);
  }
}

export class ConsoleLoggerWithPrefixes extends Logger {
  constructor(private prefix: string) {
    super();
  }

  debug(message: string) {
    console.log(`${this.prefix}: ${message}`);
  }
}
```

Use it in react component

```tsx
// App.tsx
import { DIProvider } from 'cheap-di-react';
import { Logger, SimpleConsoleLogger, ConsoleLoggerWithPrefixes } from './logger';
import { ComponentA } from './ComponentA';

const App = () => {
  return (
    <DIProvider
      // will update dependencies on each render
      dependencies={[
        dr => dr.registerImplementation(ConsoleLoggerWithPrefixes).as(Logger).inject('my message'),
      ]}
      // will update dependencies on each render
      self={[SimpleConsoleLogger]}
    >
      <ComponentA/>
    </DIProvider>
  );
};

// ComponentA.tsx
import {
  use,
  // if you have concerns about `use` name you can use `useDi` instead of 
  useDi, // alias for `use` hook
} from 'cheap-di-react';
import { Logger, SimpleConsoleLogger } from './logger';

const ComponentA = () => {
  const logger = use(Logger); // will get ConsoleLoggerWithPrefixes instance here
  logger.debug('foo'); // "my message: foo"
  
  const simpleLogger = use(SimpleConsoleLogger); // will get SimpleConsoleLogger instance here, because it is registered as itself
  simpleLogger.debug('bar'); // "bar"

  return <>...</>;
};
```

#### Optimizations
 You should memoized dependencies registration to avoid extra re-renders of entire tree
```tsx
// App.tsx
import {
  DIProvider,
  use,
  Dependency,
  SelfDependency,
} from 'cheap-di-react';
import { ComponentA } from './ComponentA';

abstract class Foo {}
class FooImpl extends Foo {}

class Bar {}

const App = () => {
  const dependencies = useMemo<Dependency[]>(() => [
    dr => dr.registerImplementation(Foo).as(FooImpl),
  ], []);

  const selfDependencies = useMemo<SelfDependency[]>(() => [Bar], []);
  
  return (
    <DIProvider
      dependencies={dependencies}
      self={selfDependencies}
    >
      <ComponentA/>
    </DIProvider>
  );
};
```
Or you may use DIProviderMemo to minimize code above
```tsx
// App.tsx
import { DIProviderMemo, use } from 'cheap-di-react';
import { ComponentA } from './ComponentA';

abstract class Foo {}
class FooImpl extends Foo {}

class Bar {}

const App = () => {
  const dependencies = useMemo<Dependency[]>(() => [
    dr => dr.registerImplementation(Foo).as(FooImpl),
  ], []);

  const selfDependencies = useMemo<SelfDependency[]>(() => [Bar], []);

  return (
    <DIProviderMemo
      dependencies={[
        dr => dr.registerImplementation(Foo).as(FooImpl),
      ]}
      self={[Bar]}
    >
      <ComponentA/>
    </DIProviderMemo>
  );
};
```
