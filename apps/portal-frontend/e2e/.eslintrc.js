module.exports = {
  env: {
    browser: true,
    node: true,
    "cypress/globals": true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:cypress/recommended",
  ],
  globals: {
    cy: "readonly",
  },
  overrides: [
    {
      files: [
        "**/*.ts",
      ],
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      }
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: [
    "cypress",
    "@typescript-eslint",
  ],
  root: true,
  rules: {
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "cypress/assertion-before-screenshot": "warn",
    "cypress/no-assigning-return-values": "error",
    "cypress/no-async-tests": "error",
    "cypress/no-force": "warn",
    "cypress/no-pause": "error",
    "cypress/no-unnecessary-waiting": "error",
    "max-len": "off",
    "require-jsdoc": 0,
  },
}
