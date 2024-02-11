import { DependencyRegistrator } from 'cheap-di';
import { DIProvider, DIProviderMemo, use } from 'cheap-di-react';
import { act, fireEvent, render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

test('use jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

describe('base cases', () => {
  abstract class Logger {
    abstract debug(message: string): string;
  }

  class SomeConsoleLogger extends Logger {
    debug(message: string) {
      return message;
    }
  }

  class ConsoleLogger extends Logger {
    constructor(private prefix: string) {
      super();
    }

    debug(message: string) {
      if (this.prefix) {
        return `${this.prefix}: ${message}`;
      }

      return message;
    }
  }

  test('register type', () => {
    const Component = () => {
      const logger = use(SomeConsoleLogger);
      return <p>{logger.debug('another layout')}</p>;
    };

    const RootComponent = () => (
      <DIProvider dependencies={[(dr) => dr.registerImplementation(SomeConsoleLogger)]}>
        <Component />
      </DIProvider>
    );

    const { queryByText } = render(<RootComponent />);
    expect(queryByText('another layout')).toBeInTheDocument();
  });

  test('register type as base type', () => {
    const Component = () => {
      const logger = use(Logger);
      return <p>{logger.debug('my layout')}</p>;
    };

    const RootComponent = () => (
      <DIProvider dependencies={[(dr) => dr.registerImplementation(ConsoleLogger).as(Logger)]}>
        <Component />
      </DIProvider>
    );

    const { queryByText } = render(<RootComponent />);
    expect(queryByText('my layout')).toBeInTheDocument();
  });

  test('register type as base type with injection params', () => {
    const Component = () => {
      const logger = use(Logger);
      return <p>{logger.debug('my layout')}</p>;
    };

    const RootComponent = () => (
      <DIProvider dependencies={[(dr) => dr.registerImplementation(ConsoleLogger).as(Logger).inject('my message')]}>
        <Component />
      </DIProvider>
    );

    const { queryByText } = render(<RootComponent />);
    expect(queryByText('my message: my layout')).toBeInTheDocument();
  });

  test('register instance', () => {
    class Database {
      readonly entities: string[];

      constructor(entities: string[]) {
        this.entities = entities;
      }
    }

    const entities = ['entity 1', 'entity 2'];

    const Component = () => {
      const database = use(Database);
      return (
        <p>
          {database.entities.map((e) => (
            <span key={e}>{e}</span>
          ))}
        </p>
      );
    };

    const RootComponent = () => (
      <DIProvider dependencies={[(dr) => dr.registerInstance(new Database(entities))]}>
        <Component />
      </DIProvider>
    );

    const { queryByText } = render(<RootComponent />);
    expect(queryByText(entities[0])).toBeInTheDocument();
    expect(queryByText(entities[1])).toBeInTheDocument();
  });

  test('nested providers', () => {
    const Component = () => {
      const logger = use(Logger);
      return <p>{logger.debug('my layout')}</p>;
    };

    const RootComponent = () => (
      <DIProvider dependencies={[(dr) => dr.registerImplementation(ConsoleLogger).as(Logger).inject('my message')]}>
        <Component />

        <DIProvider dependencies={[(dr) => dr.registerImplementation(SomeConsoleLogger).as(Logger)]}>
          <Component />
        </DIProvider>
      </DIProvider>
    );

    const { queryByText } = render(<RootComponent />);
    expect(queryByText('my message: my layout')).toBeInTheDocument();
    expect(queryByText('my layout')).toBeInTheDocument();
  });
});

describe('singleton and stateful', () => {
  test('singleton', async () => {
    class MySingleton {
      data: string = 'initial';

      async loadData() {
        this.data = await Promise.resolve('loaded data');
      }
    }

    const dependencies: ((dr: DependencyRegistrator) => void)[] = [
      (dr) => dr.registerImplementation(MySingleton).asSingleton(),
    ];

    const RootComponent = () => {
      return (
        <DIProvider dependencies={dependencies}>
          <LoadComponent />

          <DIProvider dependencies={dependencies}>
            <ReadComponent />
          </DIProvider>
        </DIProvider>
      );
    };

    const buttonId = 'my-button';

    const LoadComponent = () => {
      const mySingleton = use(MySingleton);

      return (
        <div>
          <button
            data-testid={buttonId}
            onClick={() => {
              mySingleton.loadData();
            }}
          />

          <span>{mySingleton.data}</span>
        </div>
      );
    };

    const ReadComponent = () => <span>{use(MySingleton).data}</span>;

    const { queryAllByText, getByTestId, rerender } = render(<RootComponent />);

    expect(queryAllByText('initial').length).toBe(2);
    expect(queryAllByText('loaded data').length).toBe(0);

    await act(async () => {
      fireEvent.click(getByTestId(buttonId));
    });

    rerender(<RootComponent />);

    expect(queryAllByText('initial').length).toBe(0);
    expect(queryAllByText('loaded data').length).toBe(2);
  });

  test('nested singletons', async () => {
    class Service1 {
      state: string = '123';
    }

    class Service2 {
      state: string = '456';
    }

    class Service3 {
      state: string = '789';
    }

    const buttonId = 'my-button-3';

    const TestComponent = () => {
      const s1 = use(Service1);
      const s2 = use(Service2);
      const s3 = use(Service3);

      return (
        <>
          <button
            data-testid={buttonId}
            onClick={() => {
              s3.state = '000';
            }}
          >
            update s3 state
          </button>
          <p>{s1.state}</p>
          <p>{s2.state}</p>
          <p>{s3.state}</p>
        </>
      );
    };

    const Component = () => (
      <DIProviderMemo selfSingletons={[Service1]}>
        <DIProviderMemo selfSingletons={[Service2]}>
          <DIProviderMemo selfSingletons={[Service3]}>
            <TestComponent />
          </DIProviderMemo>
        </DIProviderMemo>
      </DIProviderMemo>
    );

    const { rerender, getByTestId, queryByText } = render(<Component />);

    expect(queryByText('123')).toBeInTheDocument();
    expect(queryByText('456')).toBeInTheDocument();
    expect(queryByText('789')).toBeInTheDocument();
    expect(queryByText('000')).toBeNull();

    await act(async () => {
      fireEvent.click(getByTestId(buttonId));
    });
    rerender(<Component />);

    expect(queryByText('123')).toBeInTheDocument();
    expect(queryByText('456')).toBeInTheDocument();
    expect(queryByText('789')).toBeNull();
    expect(queryByText('000')).toBeInTheDocument();
  });
});
