const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    require.resolve('@vercel/style-guide/eslint/next'),
    'turbo',
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
  },
  plugins: [
    'only-warn',
    '@typescript-eslint',
    'check-file',
    'react-refresh',
    'react-hooks',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
    'next-env.d.ts',
  ],
  overrides: [{ files: ['*.js?(x)', '*.ts?(x)'] }],
};
