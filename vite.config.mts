import * as path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wyw from '@wyw-in-js/vite';
import rollupPluginTypeAsJsonSchema from 'rollup-plugin-type-as-json-schema';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\/(.*)/,
        replacement: `${path.join(__dirname, 'src/$1')}`,
      },
    ],
  },
  oxc: false,
  server: {
    open: true,
  },
  plugins: [
    react({
      exclude: ['node_modules/**'],
      babel: {
        configFile: true,
        babelrc: true,
      },
    }),
    rollupPluginTypeAsJsonSchema(),
    wyw({
      evaluate: false,
      sourceMap: true,
      exclude: ['node_modules/**'],
    }),
  ],
  optimizeDeps: {
    include: ['babel-runtime-jsx-plus'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/'],
    },
  },
});
