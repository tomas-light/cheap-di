import { ContainerImpl } from 'cheap-di';
import { useContext, useEffect, useState } from 'react';
import { DiContext, DiContextType } from '../DiContext.js';
import { ReactContainer } from '../ReactContainer.js';
import { InternalLogger } from '../InternalLogger.js';

type HookParams = {
  logger?: InternalLogger;
  /**
   * will be used, if there is no parent Container in React Context
   * */
  parentContainer?: ContainerImpl;
};

export function useDiContext(params: HookParams = {}) {
  const { logger = console } = params;

  const parentReactContainer = useContext(DiContext)?.container;

  const [contextValue, setContextValue] = useState<DiContextType>({
    container: undefined,
  });

  useEffect(() => {
    const parent = parentReactContainer ?? params.parentContainer;

    if (!contextValue.container) {
      if (parent) {
        logger.log('create container');
        contextValue.container = new ReactContainer(parent);
      } else {
        logger.log('create root container');
        contextValue.container = new ReactContainer();
        contextValue.container.rerender = () =>
          setContextValue({ ...contextValue });
      }

      setContextValue({ container: contextValue.container });
    }

    if (!parent || contextValue.container.sameParent(parent)) {
      return;
    }

    // exceptional case: if by some reasons parent container will be changed
    // possible, unreachable case

    logger.log('RECREATE container');
    setContextValue({ container: new ReactContainer(parent) });
  }, [parentReactContainer, params.parentContainer]);

  return contextValue;
}
