/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["@zinnia/eslint-config/basic.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  env: {
    jest: true,
  },
};
