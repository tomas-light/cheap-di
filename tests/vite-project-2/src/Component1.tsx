import { FC, useMemo } from 'react';
import { SingletonService } from './SingletonService.ts';
import { use } from 'cheap-di-react';

export const Component1: FC = () => {
  const singletonService = use(SingletonService);

  useMemo(() => {
    singletonService.token = 'modified token';
  }, []);

  return <p>{singletonService.token}</p>;
};
