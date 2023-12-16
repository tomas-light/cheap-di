import { DIProviderMemo } from 'cheap-di-react';
import { Component } from './Component';
import { Foo } from './Foo';

export function App() {
  return (
    <DIProviderMemo self={[Foo]}>
      <Component />
    </DIProviderMemo>
  );
}
