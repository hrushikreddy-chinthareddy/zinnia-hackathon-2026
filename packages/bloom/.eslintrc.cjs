/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: ["@zinnia/eslint-config/library.js"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: './tsconfig.json',
    },
    ignorePatterns: [".eslintrc.cjs"]
  };
  