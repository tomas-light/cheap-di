import { FC, memo, useMemo } from 'react';
import { DIProvider, DIProviderProps } from './DIProvider.js';

const DIProviderMemo: FC<DIProviderProps> = (props) => {
  const {
    //
    dependencies,
    self,
    selfSingletons,
    ...rest
  } = props;

  const memoizedDependencies = useMemo(() => dependencies, []);
  const memoizedSelfDependencies = useMemo(() => self, [...(self ?? [])]);
  const memoizedSelfSingletons = useMemo(() => selfSingletons, [...(selfSingletons ?? [])]);

  return (
    <DIProvider
      dependencies={memoizedDependencies}
      self={memoizedSelfDependencies}
      selfSingletons={memoizedSelfSingletons}
      {...rest}
    />
  );
};

const memoizedComponent = memo(DIProviderMemo) as FC<DIProviderProps>;
export { memoizedComponent as DIProviderMemo, type DIProviderProps as DIProviderMemoProps };
