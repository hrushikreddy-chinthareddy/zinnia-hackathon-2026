This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Please refer to the [main README](../README.md) for setup instructions.

1. Start the server

At the root of the monorepo, run `pnpm run dev:ops`.

2. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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
pnpm run test

# this will run all of the existing tests and watch for changes
pnpm run test-watch
```

### Failing Unit Tests due to Canvas

-   If you cannot run the tests due to an error with `canvas`, run the following `brew` command:
    `brew install pkg-config cairo pango libpng jpeg giflib librsvg`

### Switching between document v2 to v3

-   To switch document API calls from v2 to v3 format, use the `documents-v3-update-client-wise` flag with supported carriers in the `clients` variable in Optimizely.
-   Ensure the carrier codes are properly mapped.
-   Confirm with the EDS team that the v3 API supports the required carrier operations.

## Running Demo Environment + Test Harness Locally

1. Ask an engineer (Ed) for their `.env.demo.local` file.
2. Save this locally.
3. To run the demo instance, replace `.env.development.local` with the demo values
4. `pnpm run dev:ops`

This will start up a local instance pointed to the demo environment variables.

You might find that you are missing a lot of stuff. You will need to make sure your logged in user has all of the correct entitlements. Bother someone else who has super admin access to add your entitlements in demo access management: https://demo-access-management.vercel.app/

You will need:

-   Everglades Processor
-   Zinnia Live Test Harness
