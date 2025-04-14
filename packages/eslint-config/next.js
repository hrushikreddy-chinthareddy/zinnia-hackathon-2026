const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:storybook/recommended',
    'next/typescript',
    'prettier',
    'plugin:@typescript-eslint/recommended',
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
    'import',
    'react-refresh',
    'react-hooks',
  ],
  settings: {
    "react": {
      version: "detect",
    },
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  rules: {
    // 'check-file/no-index': 'error',
    'check-file/filename-blocklist': [
      'error',
      {
        '**/*.model.ts': '*.models.ts',
        '**/*.util.ts': '*.utils.ts',
        '**/*.helper.ts': '*.helpers.ts',
      },
    ],
    // 'check-file/folder-match-with-fex': [
    //   'error',
    //   {
    //     '*.test.{js,jsx,ts,tsx}': '**/__tests__/',
    //   },
    // ],
    // 'check-file/filename-naming-convention': [
    //   'error',
    //   {
    //     '**/*.{jsx,tsx}': 'PASCAL_CASE',
    //     '**/*.{js,ts}': 'CAMEL_CASE',
    //   },
    // ],
    // 'check-file/folder-naming-convention': [
    //   'error',
    //   {
    //     'src/components/*/': 'PASCAL_CASE',
    //     'src/!(components)/**/!(__tests__)/': 'CAMEL_CASE',
    //   },
    // ],
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
    'next-env.d.ts',
  ],
  overrides: [
    { files: ['*.js?(x)', '*.ts?(x)'] },
    {
      files: ['*.js?(x)', '*.ts?(x)'],
      rules: {
        'storybook/hierarchy-separator': 'off',
        'storybook/default-exports': 'off',
        'storybook/story-exports': 'off',
      }
    },
    {
      files: ['src/**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)'],
      rules: {
        'storybook/hierarchy-separator': 'error',
        'storybook/default-exports': 'error',
        'storybook/story-exports': 'error',
      }
    }
  ],
};
