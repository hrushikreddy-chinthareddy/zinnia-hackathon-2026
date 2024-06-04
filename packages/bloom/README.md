# Zinnia Bloom Component Library 🏵

> Welcome to the Zinnia Design System, Bloom, the backbone for building the Zinnia digital products.

## Quick Start

[![Open in Dev Containers](https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/zinnia/bloom)

- Clone this repo
- open container
- run `npm run storybook`
- pull environment tokens with `vercel env pull`
  - make sure vercel cli is installed before this (it is included in dev container)

## Tooling

- VS Code
- Docker

## See More

Please visit our [storybook](https://65a69f10c96546167b8e3e93-bjwkcaires.chromatic.com/?path=/docs/styles-using-bloom--docs)

## Status

Following sections are in progress:

- Principles
- Installation
- Tokens

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
