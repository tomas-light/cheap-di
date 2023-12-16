import { FC } from 'react';
import { Foo } from './Foo';
import { use } from 'cheap-di-react';

export const Component: FC = () => {
  const foo = use(Foo);

  return <p>{foo.do()}</p>;
};
