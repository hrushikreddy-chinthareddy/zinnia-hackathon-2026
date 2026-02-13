const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const cypress = require('eslint-plugin-cypress');
const globals = require('globals');

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

module.exports = [
    ...compat.extends(
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:cypress/recommended'
    ),
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...cypress.environments.globals.globals,
                cy: 'readonly',
            },

            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {},
        },

        plugins: {
            cypress,
            '@typescript-eslint': typescriptEslint,
        },

        rules: {
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
            'cypress/assertion-before-screenshot': 'warn',
            'cypress/no-assigning-return-values': 'error',
            'cypress/no-async-tests': 'error',
            'cypress/no-force': 'warn',
            'cypress/no-pause': 'error',
            'cypress/no-unnecessary-waiting': 'error',
            'max-len': 'off',
            'require-jsdoc': 0,
        },
    },
    {
        files: ['**/*.ts'],

        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
            },
        },
    },
];
