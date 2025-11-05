/** @type {import("eslint").Linter.Config} */

const path = require('path');

module.exports = {
  root: true,
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@/', './src'],
          [
            '@xd-components',
            path.resolve(__dirname, 'packages/xd-components/src'),
          ],
          [
            '@xd/components',
            path.resolve(__dirname, 'packages/xd-components/src/components'),
          ],
          [
            '@xd/hooks',
            path.resolve(__dirname, 'packages/xd-components/src/hooks'),
          ],
          ['@pom', path.resolve(__dirname, 'packages/pom/src')],
        ],
      },
    },
  },
  extends: ['@zinnia/eslint-config/next', 'plugin:@next/next/recommended'],
  overrides: [
    {
      files: ['**/*.stories.tsx', '*.js?(x)', '*.ts?(x)'],
      rules: {
        '@next/next/no-html-link-for-pages': 'off',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'react/no-unescaped-entities': 'off',
    'no-control-regex': 'off',
    'react/no-unstable-nested-components': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'external',
          'builtin',
          ['type', 'unknown'],
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        pathGroups: [
          {
            pattern: '@deps/**',
            group: 'internal',
          },
          {
            pattern: 'next-i18next.config',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: [],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'check-file/filename-naming-convention': [
      'error',
      {
        'src/app/*.{jsx,tsx, js, ts}': 'CAMEL_CASE',
        'src/components/*.{jsx,tsx}': 'PASCAL_CASE',
      },
      {
        ignoreMiddleExtensions: true,
      },
    ],
    'check-file/folder-naming-convention': [
      'error',
      {
        'src/app/**/': 'NEXT_JS_APP_ROUTER_CASE',
      },
    ],
  },
  ignorePatterns: ['postcss.config.js', 'jest.config.js'],
};
