/** @type {import("eslint").Linter.Config} */

const path = require('path');

module.exports = {
  root: true,
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      alias: {
        map: [
          ['@/', './src'],
          [
            '@zinnia/api-types/types',
            path.resolve(__dirname, 'api-types/generated-types'),
          ],
        ],
      },
      typescript: {
        project: path.resolve(__dirname, 'tsconfig.json'),
      },
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:storybook/recommended',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    'turbo',
    'plugin:@next/next/recommended',
  ],
  plugins: [
    'only-warn',
    '@typescript-eslint',
    'check-file',
    'import',
    'react-refresh',
    'react-hooks',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  rules: {
    // From shared next config
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
        vars: 'all',
      },
    ],
    'check-file/filename-blocklist': [
      'error',
      {
        '**/*.model.ts': '*.models.ts',
        '**/*.util.ts': '*.utils.ts',
        '**/*.helper.ts': '*.helpers.ts',
      },
    ],

    // Existing app-specific rules
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
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
  ignorePatterns: [
    // From shared next config
    '.*.js',
    'node_modules/',
    'next-env.d.ts',
    // Existing app-specific ignores
    'postcss.config.js',
    'jest.config.js',
  ],
  overrides: [
    // Existing app override for Next.js rules in stories
    {
      files: ['**/*.stories.tsx', '*.js?(x)', '*.ts?(x)'],
      rules: {
        '@next/next/no-html-link-for-pages': 'off',
      },
    },
    // From shared next config
    { files: ['*.js?(x)', '*.ts?(x)'] },
    {
      files: ['*.js?(x)', '*.ts?(x)'],
      rules: {
        'storybook/hierarchy-separator': 'off',
        'storybook/default-exports': 'off',
        'storybook/story-exports': 'off',
      },
    },
    {
      files: ['src/**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)'],
      rules: {
        'storybook/hierarchy-separator': 'error',
        'storybook/default-exports': 'error',
        'storybook/story-exports': 'error',
      },
    },
  ],
};
