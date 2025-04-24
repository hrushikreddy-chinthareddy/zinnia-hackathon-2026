/** @type {import("eslint").Linter.Config} */

const path = require("path");

module.exports = {
  settings: {
    "import/resolver": {
      "alias": {
        map: [
          ['@/', './src'],
          ['@xd-components', path.resolve(__dirname, 'packages/xd-components/src')],
          ['@xd/components', path.resolve(__dirname, 'packages/xd-components/src/components')],
          ['@xd/hooks', path.resolve(__dirname, 'packages/xd-components/src/hooks')],
          ['@pom', path.resolve(__dirname, 'packages/pom/src')],
        ]
      }
    },
    react: {
      version: 'detect',
    },
  },
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['@zinnia/eslint-config/next', 'plugin:@next/next/recommended', 'plugin:@tanstack/eslint-plugin-query/recommended'],
  overrides: [
    {
      files: ['**/*.stories.tsx'],
      rules: {
        '@next/next/no-html-link-for-pages': 'off',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'off',
    'no-control-regex': 'off',
    'react/no-unstable-nested-components': 'error',
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index'], ['type', 'unknown']],
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
  },
  ignorePatterns: ['postcss.config.js'],
};
