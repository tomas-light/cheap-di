import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { DIProviderMemo } from 'cheap-di-react';
import './App.css';
import { Component } from './Component.tsx';
import { Foo } from './Foo.ts';

function App() {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <DIProviderMemo self={[Foo]}>
        <Component />
      </DIProviderMemo>
    </>
  );
}

export default App;
