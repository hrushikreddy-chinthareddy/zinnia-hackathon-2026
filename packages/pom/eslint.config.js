import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import zinniaconfig from '@zinnia/eslint-config/library';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...zinniaconfig,
  { ignores: ['dist'] },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {},
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
