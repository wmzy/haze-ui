import config from 'tools-config/eslint';

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
      react: {version: 'detect'},
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
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
];
