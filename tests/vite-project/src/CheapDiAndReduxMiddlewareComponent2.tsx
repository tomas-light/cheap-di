import { FC } from 'react';
import { SingletonService } from './models/SingletonService.ts';
import { use } from 'cheap-di-react';

export const CheapDiAndReduxMiddlewareComponent2: FC = () => {
  const singletonService = use(SingletonService);

  return <p>{singletonService.token}</p>;
};
