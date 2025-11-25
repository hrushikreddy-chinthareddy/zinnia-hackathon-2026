# Digital Experience Monorepo

This repo contains the Ops application and SSO-MPV service for Zinnia Live. The repository is transitioning to a single-app structure as applications are being moved to separate repositories.

## What's inside?

### Apps

- **[Ops](apps/ops/README.md)** - Internal operations portal for managing Zinnia Live policies and operations
- **[SSO-MPV](apps/sso-mpv/README.md)** - Single Sign-On service for MyPolicyView authentication via Auth0 IDP connections

## Getting Started

### Pre-requisites

- For MacOS: XCode developer tools
- Node.js 20+
- [pnpm](https://pnpm.io/) - Package manager for the repository. You will want to install version `10.20.0` (see `packageManager` field in `package.json`).
- Personal Access Token
  - GitHub packages hosts our shared packages
  - Create a [personal access token](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages)
    - Log into GitHub
    - Go to Settings > Developer settings > Personal access tokens > Tokens (classic)
    - Create a new token
    - Give it `read:packages` permissions
    - Name it something meaningful
    - Make sure token is authenticated to SSO or you won't have appropriate permissions!
  - Use your personal access token by doing one of the following:
    - Edit per-user `~/.npmrc`
      - Include the following line, (replacing `PERSONAL_ACCESS_TOKEN` with your token)
        - `//npm.pkg.github.com/:_authToken=PERSONAL_ACCESS_TOKEN`
      - dev container mounts `~/.npmrc` from host env so no further config necessary
  - See more at [Authenticating to Github Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token)

### Installing the monorepo

```bash
git clone git@github.com:zinnia/digital-experience-monorepo.git
```

```bash
pnpm install
```

### Building the monorepo

Each project in the monorepo should be built with `pnpm run build`. The `build` command is also a [`task`](https://turbo.build/repo/docs/crafting-your-repository/configuring-tasks) in the monorepo. Turbo will run `pnpm run build` for each project in the monorepo.

To force build all projects in the monorepo ensure you are at the root of the monorepo:

```bash
pnpm run build
```

### Running the projects

To simplify the development process, we have created a helper script to run either Ops.

#### Setting up env variables

Options:

1. If you have vercel secrets permissions (don't be surprised if you don't), use `vercel env pull [file]` to retrieve the secrets from vercel. More details [here](https://vercel.com/docs/cli/env). `env` here is the name of the file to copy into. They are different per project, so follow that standard.

2. Otherwise, copy `.env` to `.env.development.local` for each project and request values from developer

#### Running Ops

To run Ops, use the following command:

```bash
pnpm run dev:ops
```

or you can run it directly:

```bash
cd apps/ops
pnpm run dev
```

#### Running SSO-MPV

To run SSO-MPV, use the following command:

```bash
cd apps/sso-mpv
pnpm run dev
```

Note: SSO-MPV requires additional setup. See the [SSO-MPV README](apps/sso-mpv/README.md) for details.

#### Setting up Remote Cache

Since we use Turborepo, we share a build cache between all developers
This means every machine shares the same cache, and builds should only happen once unless changes are made

> Remote Caching makes your caching multiplayer,
> sharing build outputs and logs between developers and CI/CD systems.
>
> For more information, visit: https://turborepo.com/docs/core-concepts/remote-caching

##### Set up Remote Caching

1. Login to turbo using this command from the root directory `digital-experience-monorepo/`

```bash
npx turbo login
```

2. Once you have logged in make sure you connect to the remote cache by running this command

```bash
npx turbo link
```

Type `y` to accept connection to remote cache

Use arrows to connect to `Zinnia XD` project, and press `enter`

You should see a success message!

#### Contributing

- PRs should be opened off of dev and branches must use

### Deploying

Each app has its own GitHub workflow for deployment. Workflows are triggered based on changes to specific apps.

### Repository Structure Changes

This repository previously contained multiple apps and shared packages. As part of a restructuring effort, applications are being moved to separate repositories. The `packages` directory and `consumer-experience` app have been removed. Shared code has been moved directly into the `ops` application.

### Adding a new NPM Package

This repo uses PNPM to manage packages.

To add a package to an app, use:

```bash
pnpm add --filter <app> <package>
```

For example, to add a package to ops:

```bash
pnpm add --filter ops <package>
```

OR you can `cd` into the specific app and add it there:

```bash
cd apps/ops
pnpm add <package>
```

## Development Workflow

To work on the Ops application:

```bash
pnpm run dev:ops
```

This will start the Ops application on [http://localhost:3000](http://localhost:3000).

For SSO-MPV, see the [SSO-MPV README](apps/sso-mpv/README.md) for specific setup instructions.

## Testing GitHub Workflows Locally

Testing GitHub workflows on GitHub is a big hurdle in development efficiency. Luckily, there's already a solution!

[act](https://nektosact.com/introduction.html) allows you to simulate a GitHub event, such a push to a branch or pull request, and execute all the related GitHub workflows in a Docker VM, on your local machine.

### Installation

You will need to install [Docker](https://www.docker.com/) on your local machine. If you already have [Homebrew](https://brew.sh/) installed, run this in your terminal:

```bash
  brew install --cask docker
```

Launch Docker Desktop. You don't need to log into any accounts, just press the "skip" button when it prompts you.

Next, install Act. If using Homebrew,

```bash
  brew install act
```

And you're done!

### Prerequisites

In order to execute GitHub workflows locally via Act, you will need

- Your Zinnia GitHub token. You probably already have this in your `~/.npmrc`; it should start with `//npm.pkg.github.com/:_authToken=`.
- A mock event file. There's already a mock created for PR events in `.github/workflows/mock_events/pull_request.json`. You can add other events if needed.

### Running a GitHub workflow

Act can be pre-configured, or it you can just supply everything it needs via command line args:

```bash
act \
  pull_request \
  -e .github/workflows/mock_events/pull_request.json \
  -P ubuntu-latest=catthehacker/ubuntu:act-latest \
  --reuse \
  -j prettier-typecheck-lint \
  -s GITHUB_TOKEN=<your_gh_token_here>
```

- **act** Act executable
- **pull_request** GitHub event name, and should match your "on" descriptor in the workflow
- **-e .github/workflows/mock_events/pull_request.json** Path to mock event file that supplies metadata for your GH event
- **-P ubuntu-latest=catthehacker/ubuntu:act-latest** Use the "micro" Ubuntu image, same as our actual GH actions
- **--reuse** Reuse the same Docker image from the previous run, instead of building it from scratch
- **-j prettier-lint-typecheck** Specify the action execute; this can be omitted to run all actions responding to the event
- **-s GITHUB_TOKEN=<your_gh_token>** Your GH token

This first time Act runs your workflow, it will need to build the Docker image, which takes a long time. It will skip this step as long as you use the `--reuse` arg in the command line, and all subsequent runs should be pretty fast.

## Useful Links about Turborepo

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
