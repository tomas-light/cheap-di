import { defineConfig, mergeConfig } from 'vite';
import { defineConfig as defineVitestConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import typescript from '@rollup/plugin-typescript';
import { transformer } from 'cheap-di-ts-transform';

const viteConfig = defineConfig({
  plugins: [
    react(),
    typescript({
      transformers: {
        before: [
          {
            type: 'program',
            factory: (program) => transformer({ program }),
          },
        ],
      },
    }),
  ],
});

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup-react.ts',
    include: ['**.test.{tsx,ts}'],
  },
});

export default mergeConfig(viteConfig, vitestConfig);
