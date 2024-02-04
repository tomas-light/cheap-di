import { FC, useMemo } from 'react';
import { SingletonService } from './SingletonService.ts';
import { use } from 'cheap-di-react';
import { useDispatch } from 'react-redux';
import { updateToken } from './updateToken.ts';

export const Component1: FC = () => {
  const dispatch = useDispatch();
  const singletonService = use(SingletonService);

  useMemo(() => {
    dispatch(updateToken());
  }, []);

  return <p>{singletonService.token}</p>;
};
