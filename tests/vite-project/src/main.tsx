import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootNode = document.getElementById('root');
if (rootNode) {
  const root = createRoot(rootNode);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('root node is not found');
}
