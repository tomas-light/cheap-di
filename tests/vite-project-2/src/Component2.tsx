import { FC } from 'react';
import { SingletonService } from './SingletonService.ts';
import { use } from 'cheap-di-react';

export const Component2: FC = () => {
  const singletonService = use(SingletonService);

  return <p>{singletonService.token}</p>;
};
