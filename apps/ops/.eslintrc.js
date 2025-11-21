/** @type {import("eslint").Linter.Config} */

const { resolve } = require('node:path');
const path = require('path');

const project = resolve(process.cwd(), 'tsconfig.json');

module.exports = {
    root: true,
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
        'plugin:@tanstack/eslint-plugin-query/recommended',
    ],
    globals: {
        React: true,
        JSX: true,
    },
    env: {
        node: true,
        browser: true,
        es2021: true,
    },
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
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            typescript: {
                project,
            },
            alias: {
                map: [['@/', './src']],
            },
        },
    },
    rules: {
        // From shared config
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
        // Ops-specific rules
        '@typescript-eslint/no-explicit-any': 'off',
        'react-hooks/exhaustive-deps': 'warn',
        'react/no-unescaped-entities': 'off',
        'no-control-regex': 'off',
        'react/no-unstable-nested-components': 'error',
        'import/order': [
            'error',
            {
                groups: [
                    ['builtin', 'external'],
                    'internal',
                    ['parent', 'sibling', 'index'],
                    ['type', 'unknown'],
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
    },
    ignorePatterns: [
        // From shared config
        '.*.js',
        'node_modules/',
        'next-env.d.ts',
        // Ops-specific
        'postcss.config.js',
    ],
    overrides: [
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
        {
            files: ['**/*.stories.tsx'],
            rules: {
                '@next/next/no-html-link-for-pages': 'off',
            },
        },
    ],
};
