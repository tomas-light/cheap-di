import { Provider } from 'react-redux';
import { DIProviderMemo } from 'cheap-di-react';
import { Component1 } from './Component1.tsx';
import { SingletonService } from './SingletonService.ts';
import { useEffect, useState } from 'react';
import { container, Container } from 'cheap-di';
import { Component2 } from './Component2.tsx';
import { store } from './store.ts';

export default function App() {
  const [configuredContainer, setConfiguredContainer] = useState<Container | null>(null);

  useEffect(() => {
    container.registerImplementation(SingletonService).asSingleton();
    setConfiguredContainer(container);
  }, []);

  if (!configuredContainer) {
    return null;
  }

  return (
    <Provider store={store}>
      <DIProviderMemo parentContainer={configuredContainer}>
        <Page />
      </DIProviderMemo>
    </Provider>
  );
}

const Page = () => {
  return (
    <>
      <Component1 />
      <Component2 />
    </>
  );
};
