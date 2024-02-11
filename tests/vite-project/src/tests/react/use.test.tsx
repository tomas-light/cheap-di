import { container } from 'cheap-di';
import { DIProviderMemo, use } from 'cheap-di-react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, test } from 'vitest';

beforeEach(() => {
  container.clear();
});

describe('[function] use', () => {
  let constructorCalledTimes = 0;

  class Logger {
    constructor() {
      constructorCalledTimes++;
    }

    debug(message: string) {
      return message;
    }
  }

  test('it should get singleton from parent container', async () => {
    const Component = ({ name }: { name: string }) => {
      const logger = use(Logger);
      return <p>{logger.debug(name)} </p>;
    };

    container.registerImplementation(Logger).asSingleton();

    const RootComponent = () => (
      <DIProviderMemo parentContainer={container}>
        <Component name={'test-1'} />
        <Component name={'test-2'} />
      </DIProviderMemo>
    );

    const { queryByText } = render(<RootComponent />);
    expect(queryByText('test-1')).toBeInTheDocument();
    expect(queryByText('test-2')).toBeInTheDocument();

    expect(constructorCalledTimes).toBe(1);
  });
});
