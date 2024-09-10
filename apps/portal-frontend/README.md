This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

1. `cd` to the `portal-frontend` directory

2. Switch to the appropriate version of Node via a version manager. For example, running `nvm install`. If you don't have `nvm` installed you can find the installation command at [their github](https://github.com/nvm-sh/nvm#installing-and-updating). Please don't use brew, it gets nasty and isn't the recommended method.

3. Run `cp example.env.development.local .env.development.local` and reach out to the team to identify what values to put in that new file. This will consist of several `AUTH0`, `NEXT` and `OPTIMIZELY` keys. The [Next.js documentation on env vars](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#environment-variable-load-order) is useful if you want to understand what's happening here

4. Install Packages
    > GitHub packages hosts our [Bloom Component Library](https://github.com/zinnia/bloom)
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

See more at [Authenticating to Github Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token)

1. Start the server

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

<!-- This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font. -->

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Static Content

Static content should be hosted in our S3 bucket.

The following line should be added to your `.env` file:

`NEXT_PUBLIC_S3_BUCKET_BASE_URL='https://portal-frontend-static-content.s3.amazonaws.com'`

## Running Tests

```bash
# this will run all of existing tests and update the test coverage report
npm run test

# this will run all of the existing tests and watch for changes
npm run test-watch
```

## Starting a production-like build in Docker

A production-like build allows us to better debug React errors that appear in non-local environments

> Ensure your .env.production.local file is up to date- unnecessary quotes should be removed

1. Start the Docker daemon

2. Build the image- parsing your `.env.production.local` file for build arguments

```bash
docker build -f Dockerfile.production.local -t portal-frontend $(for i in `cat .env.production.local`; do out+="--build-arg $i "; done; echo $out; out="";) .
```

3. Run the image

```bash
docker run -dp 127.0.0.1:3000:3000 --name portal-frontend --env-file .env.production.local portal-frontend
```

4. Navigate to http://localhost:3000 and login

To kill and remove the image

```bash
docker kill portal-frontend && docker rm portal-frontend
```

# Git Flow (with rebasing)

## Features

A feature is based off the `dev` branch and merged back into the `dev` branch.
It will eventually get into `main` when we make a release.

### Working Locally

```
# checkout dev, fetch the latest changes and pull them from remote into local
git checkout dev
git fetch
git pull origin dev

# create a feature branch that is based off dev
git checkout -b feature/XX-123/some-description

# do your work
git add something
git commit -m "first commit"
git add another
git commit -m "second commit"

# rebase against dev to pull in any changes that have been made
# since you started your feature branch.
git fetch
git rebase origin/dev

# push your local changes up to the remote
git push

# if you've already pushed changes and have rebased, your history has changed
# so you will need to force the push
git fetch
git rebase origin/dev
git push --force-with-lease
```

### Git workflow

-   Open a Pull Request against `dev`
-   When the Pull Request has been approved, merge using `squash and merge`, adding the ticket number and a brief description:
    ie, `MQ-330 enable users to order a pizza from the dashboard`.
-   This squashes all your commits into a single clean commit.

If you are unable to squash merge because of conflicts, you need to rebase against `dev` again:

```
# in your feature branch
git fetch
git rebase origin/dev
git push --force-with-lease
```

## Releases

A release takes the changes in `dev` and applies them to `main`.

### Working locally

```
# create a release branch from dev
git checkout test
git fetch
git pull origin test
git checkout -b release/3.2.1

# finalise the change log, local build, etc
git add CHANGELOG.md
git commit -m "Changelog"

# rebase against main, which we're going to merge into
git fetch
git rebase origin/main
git push --force-with-lease
```

Usually at this point you will want to deploy the release branch to the staging server for final QA.
If there are any issues, fixes should be committed to the release branch.

### Git workflow

-   Open a Pull Request against `main`
-   When the PR is approved and the staging deploy has been verified by QA, merge using `rebase and merge`.
-   **DO NOT SQUASH MERGE**. We don't want a single commit for the release, we want to maintain the feature commits in the history.
-   Repeat the steps above against `dev` (may need to rebase first).
-   Tag a release on main. Use the version number and put the changelog in the description.

## Hotfixes

A hotfix is a patch that needs to go directly into `main` without going through the regular release process.
The most common use case is to patch a bug that's on production when `dev` contains code that isn't yet ready for release.

### Working locally

```
# create a hotfix branch based on main, because main is what will be deployed to production
git checkout main
git fetch
git pull origin main
git checkout -b hotfix/describe-the-problem

git add patch.fix
git commit -m "fix the problem"
git push
```

### Git workflow

-   Open a Pull Request against `main`
-   When the PR's approved and the code is tested, `squash and merge` to squash your commits into a single commit.
-   Open a Pull Request against `dev` (may need to rebase first).
-   Tag a release on `main`. Describe the issue in the name, feel free to put details in the description.
