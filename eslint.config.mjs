import { createRequire } from 'module';

import config from 'tools-config/eslint';

// eslint 10 移除了 context.getFilename()，react 'detect' 模式依赖它，改读实际安装版本
const reactVersion = createRequire(import.meta.url)('react/package.json').version;

export default [
  ...config,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {version: reactVersion},
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'react/no-unknown-property': ['error', {ignore: ['x-class', 'x-if']}],
      'react/prop-types': 'off',
    },
  },
  {
    // 与 react-hooks 插件声明块的 files 对齐（不含 .mjs），否则 ESLint 10 报插件不可见
    files: ['**/*.{js,ts,jsx,tsx}'],
    rules: {
      // tools-config 0.3 改用 eslint-plugin-import-x，规则前缀随之变更
      'import-x/no-unresolved': 'off',
      // react-hooks 7 的 React Compiler 分析规则对既有异步/DOM 驱动模式偏保守，降为 warn 渐进采用
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  {
    ignores: ['dist/**'],
  },
];
