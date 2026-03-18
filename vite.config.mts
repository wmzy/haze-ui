import * as path from 'path';
import { fileURLToPath } from 'url';

import { transformAsync } from '@babel/core';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import wyw from '@wyw-in-js/vite';
import rollupPluginTypeAsJsonSchema from 'rollup-plugin-type-as-json-schema';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isLibBuild = process.env.BUILD_LIB === 'true';

function jsxPlusPlugin(): Plugin {
  return {
    name: 'jsx-plus',
    enforce: 'pre',
    async transform(code, id) {
      if (!/\.[jt]sx$/.test(id) || id.includes('node_modules')) return;
      if (!code.includes('x-class') && !code.includes('x-if')) return;
      const result = await transformAsync(code, {
        filename: id,
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: ['jsx', 'typescript'] },
        plugins: ['transform-jsx-condition', 'transform-jsx-class'],
      });
      if (!result?.code) return;
      return { code: result.code, map: result.map };
    },
  };
}

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\/(.*)/,
        replacement: `${path.join(__dirname, 'src/$1')}`,
      },
    ],
  },
  server: {
    open: true,
  },
  plugins: [
    jsxPlusPlugin(),
    react({
      exclude: ['node_modules/**'],
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
  build: isLibBuild
    ? {
        lib: {
          entry: path.resolve(__dirname, 'src/lib/index.ts'),
          formats: ['es'],
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            '@linaria/core',
            'react-use-control',
            'react-toolroom',
            'react-toolroom/async',
            '@native-router/react',
            '@for-fun/event-emitter',
            'babel-runtime-jsx-plus',
          ],
          output: {
            preserveModules: true,
            preserveModulesRoot: 'src/lib',
            entryFileNames: '[name].js',
          },
        },
        cssCodeSplit: false,
      }
    : undefined,
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
