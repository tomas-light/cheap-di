import { FC, useMemo } from 'react';
import { DIProvider, DIProviderProps } from './DIProvider.js';

const DIOneTimeProvider: FC<DIProviderProps> = (props) => {
  const { dependencies, self, children, ...rest } = props;

  const memoizedDependencies = useMemo(() => dependencies, []);
  const memoizedSelfDependencies = useMemo(() => self, []);
  return (
    <DIProvider dependencies={memoizedDependencies} self={memoizedSelfDependencies} {...rest}>
      {children}
    </DIProvider>
  );
};

export { DIOneTimeProvider };
export type { DIProviderProps as DIOneTimeProviderProps };
