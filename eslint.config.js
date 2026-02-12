const tsParser = require('@typescript-eslint/parser');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  ...compat.extends('@zinnia/eslint-config/library'),
  {
    languageOptions: {
      parser: tsParser,

      parserOptions: {
        project: true,
      },
    },
  },
  {
    ignores: ['apps/**/*', 'packages/**/*'],
  },
];
