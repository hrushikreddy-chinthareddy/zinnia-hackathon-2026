# Application overview

This application is built for policy owners to view and manage their policies across different carriers.

Designs are [here](https://www.figma.com/design/k5mQyI3uXge7PZWj6LKJDD/Development-Ready%3A-Consumer-UI?node-id=8-5593&m=dev)
Component specific designs [here](https://www.figma.com/design/VDRT7fr0CytOXHDt8S6wYB/Consumer-UI-Components?node-id=0-1&t=VEj7lkjJWPrW8BgW-0)

Components that are global to Zinnia products are imported from [Bloom](https://github.com/zinnia/bloom).

# Getting started

- To clone the repo, use [Github CLI](https://zinnia.atlassian.net/wiki/spaces/AU/pages/3749937195/Onboarding#Accessing-GitHub)

## Things to install

- [nvm ](https://github.com/nvm-sh/nvm)
- node >20 -> run `nvm install 20`
- accessiblity plugins (see [docs](https://zinnia.atlassian.net/wiki/spaces/AU/pages/3707568138/Accessibility))

### Packages

- [pnpm](https://pnpm.io/)

### VS Code plugins

**Required**

- [Codeium ](https://codeium.com/vscode_tutorial)
  - Contact Ryan to be added to license
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

**Recommended**

- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- [TODO Highlight](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight)
  - this allows you to add TODOs with `TODO` syntax and they'll be clearly highlighted in your code.
- [React/Redux/JS Snippies](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
- [CSS Variable Autocomplete](https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-css-variables)

### Recommended VSCode settings

- Some settings have included in `.vscode/settings.json`

Add to your settings.json

```
  "editor.stickyScroll.enabled": true,
  "workbench.tree.enableStickyScroll": true,
    "files.trimTrailingWhitespace": true,
```

### Setup

- Get the env variables from your favorite or least favorite local developer.

## Setting up a new user:

1. [Create oauth token ](https://zinnia.atlassian.net/wiki/spaces/CIAMC/pages/3999793180/OAuth+M2M+Token+How-To)
2. create a policy. See [doc](https://se2llc-global.slack.com/archives/C069ZQ0REET/p1719252268702579?thread_ts=1719248037.803579&cid=C069ZQ0REET) for steps to create one.

# Local development

## Dev Menu

There is a dev menu availble for several different mocking purporses. To turn it on, add `..show_dev_menu..=true` as a query string.

If you click `Show test policies` but still aren't able to see more than your account's policies, your account may not have ops level permissions, and you will only be able to view the policies assigned to your user.

## Opening a PR

1. Open a PR into dev (or feature branch)
2. include details in PR with helpful screenshots and context
3. Add link to ticket in Jira
4. once you PR has been approved, open Vercel `Preview Link`, change the settings to `anyone with link can view`, add to the ticket and move it to `Ready for QA`
5. Once PR has passed QA, merge changes

# Styling

There's a mix of global, css modules and utility classes in the project. We decided to add utility classes for things like spacing and borders so that devs wouldn't have to make an additional style file for simple components.

# Branching Strategy & Environments

See [docs](https://zinnia.atlassian.net/wiki/spaces/AU/pages/3635053021/Deployments+Environments) for more info on environments

[Release Flow](https://zinnia.atlassian.net/wiki/spaces/AU/pages/4024860691/Git+and+Release+Workflow)

TLDR

- Rebase on feature branches only. Rebasing on long running branches causes wild merge conflicts.
- for feature development, branch from dev (or feature branch) open pr back into dev

# App Configuration

## Vercel

- Vercel is used for deploying ephemeral or preview environments so that features and updates can be tested before merging PRs into the dev branch.
- Once you open a pr, you will see a Vercel section that includes links to the generated preview environment. Paste this in the ticket for product and/or design to review.

## Github actions

### Variables

1. Variables that are used in the frontend (i.e. anything that requires `NEXT_PUBLIC` in the key) should be added to the github secrets (this is available in Github. You may not have access to this tab, so if you don't see it on your github, message `xd-engineering`)
2. you will then need to add the variable to the Dockerfile. Add it as an `ARG` then set it as an `ENV` variable
3. Also add them to `turbo.json` and `environment.d.ts` to get the intellisense.

_Anything in `build-args` in the `deploy-action.yml` needs to be added to the Dockerfile_

## AWS

[Task Definitions](https://github.com/zinnia/aws-consumer-task-definitions/blob/main/dev.json)

Find more info about Architecture [here](https://zinnia.atlassian.net/wiki/spaces/AU/pages/3635052844/Architechture)

## Logging and Runbook

- [Runbook](https://zinnia.atlassian.net/wiki/spaces/AU/pages/4095737866/Zinnia+Live+Admin+UI+OPS+Runbook)
- [Backend Logs](https://app.datadoghq.com/logs?query=service%3A%28xd_consumer_experience%20OR%20consumer-xd%29%20%40level%3A%3E10%20&agg_m=count&agg_m_source=base&agg_t=count&cols=host%2Cservice&fromUser=true&messageDisplay=inline&refresh_mode=sliding&saved-view-id=2691016&storage=hot&stream_sort=desc&viz=stream&from_ts=1717109319990&to_ts=1717110219990&live=true)
- [Dashboard](https://app.datadoghq.com/dashboard/j4x-kw3-ax3/consumer-xd?fromUser=false&refresh_mode=sliding&view=spans&from_ts=1717370545740&to_ts=1717456945740&live=true)
- [RUM a.k.a frontend logging](https://app.datadoghq.com/rum/performance-monitoring?query=%40application.id%3Ae4442d80-e7ae-459b-99b7-f720ac078f14%20%40session.type%3Auser&fromUser=false&tab=overview&from_ts=1716852161544&to_ts=1717456961544&live=true)
- Ephemeral environment logs: Because vercel's ephemeral environments run as edge functions, these logs won't be available within Datadog, however, you can still view them in vercel

# Feature Flags

Feature flags are implemented using [Optimizely Javascript SDK](https://docs.developers.optimizely.com/feature-experimentation/docs/javascript-sdk). The React SDK doesn't work for server side rendering.

## Access

To get access, contact a lead. You will need to get a PolicyGenius email and be added to the Optimizely account to log in.

# TODO Docs

TBD
