import { Constructor, Container, DependencyRegistrator, isSingleton } from 'cheap-di';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import { DiContext } from '../DiContext.js';
import { useDiContext } from '../hooks/index.js';
import { InternalLogger } from '../InternalLogger.js';

type Dependency = (dependencyRegistrator: DependencyRegistrator) => void;
type SelfDependency = Constructor;

interface Props {
  /**
   * using of cheap-di API to register dependencies as you wish
   * @example
   * <DIProvider dependencies={[
   *   (dr) => dr.registerImplementation(Foo).as(Bar),
   *   (dr) => dr.registerImplementation(Foo2).as(Bar2),
   *   // ...
   * ]}>
   *   <MyComponent />
   * </DIProvider>
   * */
  dependencies?: Dependency[];

  /**
   * shortcut for container.registerImplementation(<you-class>), when you want to keep code simple, without using interfaces (abstract classes)
   * @example
   * <DIProvider self={[Foo, Bar]}>
   *   <MyComponent />
   * </DIProvider>
   * */
  self?: SelfDependency[];

  /**
   * shortcut for container.registerImplementation(<you-class>).asSingleton()
   * @example
   * <DIProvider selfSingletons={[Foo, Bar]}>
   *   <MyComponent />
   * </DIProvider>
   * */
  selfSingletons?: SelfDependency[];

  /**
   * adds your configured container as root container to your React tree
   * @example
   * import { container } from 'cheap-di';
   *
   * class Foo {}
   *
   * const App = () => {
   *   const [configuredContainer] = useState(() => {
   *     container.registerImplementation(Foo);
   *     // ...
   *   });
   *
   *   return (
   *     <DIProvider parentContainer={configuredContainer}>
   *       <MyComponent />
   *     </DIProvider>
   *   );
   * }
   * */
  parentContainer?: Container;

  /** enables logging of dependencies registrations */
  debugName?: string;

  children: ReactNode;
}

const DIProvider: FC<Props> = (props) => {
  const { dependencies, self, selfSingletons, parentContainer, debugName, children } = props;

  const [logger] = useState(() => new InternalLogger(debugName));
  const [initialized, setInitialized] = useState(false);
  const timerRef = useRef<any>(null);
  const diContext = useDiContext({ logger, parentContainer });
  const { container: reactContainer } = diContext;

  useEffect(() => {
    const isAnyConfigurationPassed = dependencies || self || selfSingletons || parentContainer;
    if (!reactContainer || !isAnyConfigurationPassed) {
      return;
    }

    reactContainer.clear();
    logger.log('dependency registrations');

    const singletonsSizeBeforeDependenciesUpdate = reactContainer?.getSingletons().size ?? 0;
    dependencies?.forEach((dependency) => dependency(reactContainer));
    self?.forEach((selfDependency) => reactContainer.registerImplementation(selfDependency));
    selfSingletons?.forEach((selfDependency) => reactContainer.registerImplementation(selfDependency).asSingleton());

    logger.log('singleton and stateful configurations');

    for (const [type] of reactContainer.getDependencies()) {
      const implementation = reactContainer.localScope((container) => container.getImplementation(type));
      if (!implementation) {
        continue;
      }

      if (isSingleton(implementation as Constructor)) {
        logger.log('singleton', implementation, 'founded');
        // instantiate singleton in local scope (it may use local scope dependencies)
        reactContainer.resolve(type);
      }
    }

    if (
      reactContainer.parentContainer &&
      singletonsSizeBeforeDependenciesUpdate !== reactContainer.getSingletons().size
    ) {
      logger.log('singletons size changed, trigger root rerender');
      timerRef.current = setTimeout(() => {
        reactContainer.rootReactContainer.rerender();
      });
    }

    setInitialized(true);
  }, [reactContainer, dependencies, self, selfSingletons]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      reactContainer?.clear();
    };
  }, []);

  if (!initialized) {
    return null;
  }

  return <DiContext.Provider value={diContext}>{children}</DiContext.Provider>;
};

export { DIProvider };
export type { Props as DIProviderProps };
