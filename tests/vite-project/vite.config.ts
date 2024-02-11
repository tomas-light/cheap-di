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
            factory: (program) =>
              transformer(
                { program },
                {
                  debug: true,
                  addDetailsToUnknownParameters: true,
                  logRegisteredMetadata: true,
                  errorsLogLevel: 'debug',
                  esmImports: true,
                  deepRegistration: true,
                }
              ),
          },
        ],
      },
    }),
  ],
});

const vitestConfig = defineVitestConfig({
  test: {
    environment: 'jsdom',
    include: ['**.test.{tsx,ts}'],
  },
});

export default mergeConfig(viteConfig, vitestConfig);
