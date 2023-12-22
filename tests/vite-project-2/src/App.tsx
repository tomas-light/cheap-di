import { DIProviderMemo } from 'cheap-di-react';
import { Component1 } from './Component1.tsx';
import { SingletonService } from './SingletonService.ts';
import { useEffect, useState } from 'react';
import { container, Container } from 'cheap-di';
import { Component2 } from './Component2.tsx';

function App() {
  const [configuredContainer, setConfiguredContainer] = useState<Container | null>(null);

  useEffect(() => {
    (async () => {
      // imitate async configuration
      const _container = await new Promise<Container>((resolve) => {
        setTimeout(() => {
          container.registerImplementation(SingletonService).asSingleton();
          resolve(container);
        });
      });

      setConfiguredContainer(_container);
    })();
  }, []);

  if (!configuredContainer) {
    return null;
  }

  return (
    <DIProviderMemo parentContainer={configuredContainer}>
      <Component1 />
      <Component2 />
    </DIProviderMemo>
  );
}

export default App;
