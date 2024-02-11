import { FC } from 'react';
import { Foo } from './models/Foo.ts';
import { use } from 'cheap-di-react';

export const CheapDiReactComponentExample: FC = () => {
  const foo = use(Foo);

  return <p>{foo.do()}</p>;
};
