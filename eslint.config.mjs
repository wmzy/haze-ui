import compat from 'eslint-plugin-compat';
import config from 'tools-config/eslint/type-checked';

export default [
  ...config,
  {
    // 与 react-hooks 插件声明块的 files 对齐（不含 .mjs），否则 ESLint 10 报插件不可见
    files: ['**/*.{js,ts,jsx,tsx}'],
    rules: {
      'import-x/no-unresolved': 'off',
      // react-hooks 7 的 React Compiler 分析规则对既有异步/DOM 驱动模式偏保守，降为 warn 渐进采用
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  {
    // JS API 面门禁：compat/compat 按 package.json 的 browserslist 字段
    // （chrome/edge 119+、safari 16.4+、firefox 128+）标红未达标的现代 API。
    // 只管 JS —— CSS（OKLCH/relative color/popover/anchor）有意直出不转译，不经此门。
    // lintAllEsApis：根 babel.config.mjs 只挂 JSX 转换插件、无 preset-env/polyfill，
    // 必须显式声明，否则插件误判「已转译」跳过全部 ES 内建 API 检查。
    files: ['src/**/*.{ts,tsx}'],
    plugins: { compat },
    settings: {
      lintAllEsApis: true,
    },
    rules: {
      'compat/compat': 'error',
    },
  },
  {
    ignores: ['dist/**'],
  },
];
