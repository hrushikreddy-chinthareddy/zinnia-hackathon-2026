# Digital Experience Monorepo

This repo contains the necessary apps and packages used to build and maintain Zinnia Live.

## What's inside?

### Apps

These are consumer-facing end products that are deployable or deliverable in some form. Apps are typically configured to be started or deployed, like web frontends, backend services, mobile applications, desktop applications, etc. They are the final artifacts that end users interact with.

- [Consumer Experience](apps/consumer-experience/README.md)

### Packages

These consist of shared libraries, components, utilities, or any common code that is used by multiple apps within the monorepo. Packages are not meant to be deployed independently; instead, they are included as dependencies in apps or other packages. They can, however, optionally be published to our [NPM respository](https://github.com/orgs/zinnia/packages).

- [API Types](packages/utils/README.md)
- [ESlint Config](packages/eslint-config/README.md)
- [Prettier Config](packages/prettier-config/README.md)
- [Jest Presets](packages/jest-presets/README.md)
- [Typescript Config](packages/typescript-config/README.md)
- [Utils](packages/utils/README.md)

## Getting Started

### Pre-requisites

- Node.js 20+
- [pnpm](https://pnpm.io/) - We use `pnpm` because it has better support for monorepos. It has a lot of built in tools that make it easier to filter on the app or package you want to build and deploy. You will want to install version `9.4.0`.
- Personal Access Token
  - GitHub packages hosts our shared packages
  - Create a [personal access token](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages)
    - Make sure it has `read:packages` permissions
    - Make sure token is authenticated to SSO or you won't have appropriate permissions!
  - Use your personal access token by doing one of the following:
    - Edit per-user `~/.npmrc`
      - Include the following line, (replacing `PERSONAL_ACCESS_TOKEN` with your token)
        - `//npm.pkg.github.com/:_authToken=PERSONAL_ACCESS_TOKEN`
      - dev container mounts `~/.npmrc` from host env so no further config necessary
    - Log into npm command line
      - run `npm run login:gh-pkg`
      - username will be your github username (all lowercase)
      - password is your personal access token
  - See more at [Authenticating to Github Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token)

### Installing the monorepo

```bash
git clone git@github.com:zinnia/digital-experience-monorepo.git
```

```bash
pnpm install
```

### Building the monorepo

Each project in the monorepo should be built with `pnpm run build`. The `build` command is also a [`task`](https://turbo.build/repo/docs/crafting-your-repository/configuring-tasks) in the monorepo. Turbo will run `pnpm run build` for each project in the monorepo. The `build` is also setup to only build projects that have changes since the last commit.

To build all projects in the monorepo ensure you are at the root of the monorepo:

```bash
pnpm run build
```

### Troubleshooting

#### Error running tests due to `Cannot find module '../build/Release/canvas.node'`

You may see this error when running tests (either independently or part of the git push). In order to fix you'll need to install some packages. Refer to [this article](https://flaviocopes.com/fix-node-canvas-error-pre-gyp-macos/) for steps to fix.

### Deploying the monorepo

Each `app` and `package` will have their own github workflow. This will allow us to deploy only the `apps` and `packages` that have changes since the last commit.

### Adding a new local package

To add a new package to the monorepo create a new directory in the `packages` folder and add a `package.json` file. The package name should be prefixed with `@zinnia/`. The package directory name should be the name of the package without the `@zinnia` prefix.

Once you have created the package update the package.json file of the `app` you want to add the package to. For example, to add the `utils` package to the `consumer-experience` app:

// packages/consumer-experience/package.json

```bash
{
  "dependencies": {
    "@zinnia/utils": "workspace:*"
  }
}
```

### Adding a new NPM Package

This repo uses PNPM to manage packages as it supports monorepos better than NPM.

To add a package ensure you are in the root of the monorepo, use:

```
pnpm add --filter <app> <package>
```

So for consumer-experience, it would be:

```
pnpm add --filter consumer-experience <package>
```

OR if you prefer you can `cd` into the specific `app` and add it there:

```bash
cd apps/consumer-experience
pnpm add <package>
```

### Publishing a package

The publish-action.yml workflow automates the process of publishing our project's packages to the GitHub Package Registry. This workflow can be triggered manually.

#### Features

- Dry Run Option: Before publishing, you can perform a dry run to see potential outcomes without affecting the actual registry.
- Version Management: Currently, the process of versioning packages requires manual intervention. Developers are responsible for updating the version number in the respective package according to semantic versioning rules before triggering the workflow.
- Multi-Package Support: You are able to select the package to publish.

#### Workflow Triggers

This workflow can be triggered under the following conditions:

- Manual Trigger: Through GitHub's UI, allowing for the selection of specific options such as the package to publish or whether to perform a dry run.

#### Inputs

The workflow accepts the following inputs:

- dry-run: (Optional) If set to true, the workflow will execute a dry run of the publish process. Default: false.
- package-name: (Required) The name of the package you wish to publish. Options include: api-types, eslint-config, prettier-config, typescript-config, utils.
- node-version-file: (Optional) Specifies the Node.js version to use, defaulting to the version specified in .nvmrc.

## Examples

Below are some examples of how you would make an update to a `package` and see it reflected in an `app`.

- Making an update to `@zinnia/utils`

  1. At the `root` of the monorepo run `pnpm run link-package -- @zinnia/utils consumer-experience`
  2. At the `root` of the monorepo run `pnpm run build --filter @zinnia/utils`
  3. Next run the following command at the `root` of the monorepo:

  ```bash
    pnpm run dev --filter @zinnia/utils
    pnpm run dev --filter consumer-experience
  ```

  4. Make the necessary changes
  5. Update the package.json file version
  6. Before you commit you changes ensure you do not commit the package.json file with the `@zinnia/utils` package linked.
     - To unlink the `package` run `pnpm run unlink-package -- consumer-experience`
  7. Commit your changes and open a PR
  8. After your PR is merged run the [Publishing a Package](README.md#publishing-a-package) workflow

  > NOTE: We don't want to run `pnpm run dev` without filtering because it will run the `dev` script for all `apps` and `packages` in the monorepo.

## Useful Links about Turborepo

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
