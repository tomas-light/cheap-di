# cheap-di-react
Integration of cheap-di into React via React.context

## How to use

There is simple logger.
`logger.ts`
```ts
export abstract class Logger {
  abstract debug(message: string): void;
}

export class ConsoleLogger extends Logger {
  constructor(private prefix: string) {
    super();
  }

  debug(message: string) {
    console.log(`${this.prefix}: ${message}`);
  }
}

export class AnotherConsoleLogger extends Logger {
  debug(message: string) {
    console.log(message);
  }
}
```

Use it in react

`components.tsx`
```tsx
import {
  DIProvider,
  DIOneTimeProvider,
} from 'cheap-di-react';
import { Logger, ConsoleLogger } from './logger';

const RootComponent = () => {
  return (
    <>
      <DIProvider
        // will update dependencies on each render
        dependencies={[
          dr => dr.registerType(ConsoleLogger).as(Logger).with('my message'),
        ]}
        // shortcut for dependencies={[ dr => dr.registerType(AnotherConsoleLogger) ]}
        self={[AnotherConsoleLogger]}
      >
        <ComponentA/>
      </DIProvider>

      <DIOneTimeProvider
        // will use initial dependecies (it uses useMemo under hood)
        dependencies={[
          dr => dr.registerType(ConsoleLogger).as(Logger).with('my message'),
        ]}
        // will use initial self dependecies (it uses useMemo under hood)
        self={[AnotherConsoleLogger]}
      >
        <ComponentA/>
      </DIOneTimeProvider>
    </>
  );
};

const ComponentA = () => {
  const logger = use(Logger);
  logger.debug('bla-bla-bla');

  return 'my layout';
};

const ComponentB = () => {
  const logger = use(AnotherConsoleLogger); // because we registered it as self
  logger.debug('bla-bla-bla');

  return 'my layout';
};
```

But remember, if you want to use auto resolving your dependencies with typescript reflection, you need
`"emitDecoratorMetadata": true,` in `tsconfig.ts` and any class-decorator for your service-class (read more in 
`cheap-di` README.md)
