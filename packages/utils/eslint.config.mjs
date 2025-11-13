import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        jest: 'readonly',
        node: true,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '.*.js'],
  },
];
