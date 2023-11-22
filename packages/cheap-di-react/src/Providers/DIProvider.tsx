import { Constructor, Container, DependencyRegistrator, isSingleton } from 'cheap-di';
import { FC, Fragment, memo, ReactNode, useEffect, useRef, useState } from 'react';
import { DiContext } from '../DiContext.js';
import { useDiContext } from '../hooks/index.js';
import { InternalLogger } from '../InternalLogger.js';

type Dependency = (dependencyRegistrator: DependencyRegistrator) => void;
type SelfDependency = Constructor;

interface Props {
  dependencies?: Dependency[];
  self?: SelfDependency[];
  selfSingletons?: SelfDependency[];
  parentContainer?: Container;
  /** if it is provided, logging will be enabled */
  debugName?: string;
  children: ReactNode;
}

const DIProvider: FC<Props> = (props) => {
  const { dependencies, self, selfSingletons, parentContainer, debugName, children } = props;

  const [logger] = useState(() => new InternalLogger(debugName));
  const [initialized, setInitialized] = useState(false);
  const timerRef = useRef<any>(null);
  const diContext = useDiContext({ logger, parentContainer });
  const { container } = diContext;

  useEffect(() => {
    const isAnyConfigurationPassed = dependencies || self || selfSingletons || parentContainer;
    if (!container || !isAnyConfigurationPassed) {
      return;
    }

    container.clear();
    logger.log('dependency registrations');

    const singletonsSizeBeforeDependenciesUpdate = container?.getSingletons().size ?? 0;
    dependencies?.forEach((dependency) => dependency(container));
    self?.forEach((selfDependency) => container.registerImplementation(selfDependency));
    selfSingletons?.forEach((selfDependency) => container.registerImplementation(selfDependency).asSingleton());

    logger.log('singleton and stateful configurations');

    for (const [type] of container.getDependencies()) {
      const constructor = container.localScope((_container) => _container.getImplementation(type));
      if (!constructor) {
        return;
      }

      if (isSingleton(constructor as Constructor)) {
        logger.log('singleton', constructor, 'founded');
        // resolve type to get and register its instance
        container.resolve(type);
      }
    }

    if (container.parentContainer && singletonsSizeBeforeDependenciesUpdate !== container.getSingletons().size) {
      logger.log('singletons size changed, trigger root rerender');
      timerRef.current = setTimeout(() => {
        container.rootContainer.rerender();
      });
    }

    setInitialized(true);
  }, [container, dependencies, self]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      container?.clear();
    };
  }, []);

  if (!initialized) {
    return null;
  }

  return (
    <DiContext.Provider value={diContext}>
      <MemoizedChildren>{children}</MemoizedChildren>
    </DiContext.Provider>
  );
};

const MemoizedChildren: FC<{ children: ReactNode }> = memo(({ children }) => <Fragment>{children}</Fragment>);

const memoizedComponent = memo(DIProvider) as FC<Props>;
export { memoizedComponent as DIProvider };
export type { Props as DIProviderProps };
