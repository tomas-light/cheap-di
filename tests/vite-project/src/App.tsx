import { container, Container } from 'cheap-di';
import { DIProviderMemo } from 'cheap-di-react';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { CheapDiReactComponentExample } from './CheapDiReactComponentExample.tsx';
import { Foo } from './models/Foo.ts';
import { SingletonService } from './models/SingletonService.ts';
import { store } from './redux/store.ts';
import { CheapDiAndReduxMiddlewareComponent1 } from './CheapDiAndReduxMiddlewareComponent1.tsx';
import { CheapDiAndReduxMiddlewareComponent2 } from './CheapDiAndReduxMiddlewareComponent2.tsx';

function App() {
  const [configuredContainer, setConfiguredContainer] = useState<Container | null>(null);

  useEffect(() => {
    container.registerImplementation(SingletonService).asSingleton();
    setConfiguredContainer(container);
  }, []);

  if (!configuredContainer) {
    return null;
  }

  return (
    <>
      <Provider store={store}>
        <DIProviderMemo parentContainer={configuredContainer}>
          <CheapDiAndReduxMiddlewareComponent1 />
          <CheapDiAndReduxMiddlewareComponent2 />
        </DIProviderMemo>
      </Provider>

      <DIProviderMemo self={[Foo]}>
        <CheapDiReactComponentExample />
      </DIProviderMemo>
    </>
  );
}

export default App;
