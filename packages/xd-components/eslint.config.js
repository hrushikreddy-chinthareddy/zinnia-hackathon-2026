import globals from 'globals'
import tseslint from 'typescript-eslint'
import zinniaconfig from '@zinnia/eslint-config/library'

export default tseslint.config(
  { ignores: ['dist'] },
  ...zinniaconfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
)
