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
const isDemoBuild = process.env.BUILD_DEMO === 'true';

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

const buildConfig = (() => {
  if (isLibBuild) {
    return {
      lib: {
        entry: path.resolve(__dirname, 'src/lib/index.ts'),
        formats: ['es'] as const,
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
    };
  }
  if (isDemoBuild) {
    return {
      outDir: 'dist',
    };
  }
  return undefined;
})();

export default defineConfig({
  base: isDemoBuild ? '/haze-ui/' : '/',
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
      classNameSlug: (hash, title, args) => `haze-${args.name}__${title}`,
    }),
  ],
  optimizeDeps: {
    include: ['babel-runtime-jsx-plus'],
  },
  build: buildConfig,
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test-setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**/*.{ts,tsx}'],
      exclude: [
        'src/lib/**/*.test.{ts,tsx}',
        'src/lib/**/index.ts',
        'src/lib/tokens/**',
        '**/*.d.ts',
      ],
    },
  },
});
