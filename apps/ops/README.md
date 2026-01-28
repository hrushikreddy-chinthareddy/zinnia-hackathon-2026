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

## Implementing Embedded Components (ZEmbed)

This application uses ZEmbed to load and render embedded web components from external modules. Follow these steps to implement a new embedded component in your page.

### Step 1: Import and Use the `useZEmbedInit` Hook

The `useZEmbedInit` hook initializes the ZEmbed system and loads the specified modules.

```tsx
import { useCallback, useMemo } from 'react';
import { useZEmbedInit } from '@deps/hooks/useZEmbedInit';

export default function YourPage({ accessToken }: { accessToken: string }) {
    const getAccessToken = useCallback(async () => {
        return accessToken;
    }, [accessToken]);

    const zembedConfig = useMemo(
        () => ({
            modules: ['your-module-name'], // Array of module names to load
            debug: process.env.NODE_ENV === 'development',
            accessToken: getAccessToken,
        }),
        [getAccessToken]
    );

    const { success, error } = useZEmbedInit(zembedConfig);

    if (!success && error) {
        return <div>Error: {error?.message}</div>;
    }

    return (
        <div>
            <zen-your-component
                id="your-component"
                data-prop-name="value"
            ></zen-your-component>
        </div>
    );
}
```

### Step 2: Configure Server-Side Props

Ensure your page's `getServerSideProps` retrieves the access token and passes it to the component:

```tsx
import { getAccessToken } from '@auth0/nextjs-auth0';

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, _loggingContext) => {
            const { req, res } = context;

            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                return serverSidePropsLogout();
            }

            return {
                props: {
                    accessToken,
                    // ... other props
                },
            };
        },
    },
    {
        file: 'your-page-path',
        function: 'getServerSideProps',
        page: 'your-page-path',
    }
);
```

### Step 3: Add Module to Manifest Configuration

Add your new module to the manifest configuration in `src/pages/api/manifests/index.ts`:

```typescript
const manifests: Config[] = [
    // ... existing manifests
    {
        manifest: {
            module: 'your-module-name', // Must match the name in zembedConfig.modules
            version: '1.0.0',
            assets: {
                css: [
                    `${process.env.NEXT_PUBLIC_ZEMBED_CDN_URL}/modules/YourModule/v1/YourModule.css`,
                ],
                js: [
                    `${process.env.NEXT_PUBLIC_ZEMBED_CDN_URL}/modules/YourModule/v1/YourModule.js`,
                ],
            },
        },
    },
];
```

**Note:** This manifest configuration will be moved to a different API in the future, but for now, this is where module configurations should be added.

### Step 4: Environment Variables

Ensure the following environment variables are set in your `.env` file:

```bash
NEXT_PUBLIC_ZEMBED_CDN_URL=<your-zembed-cdn-url>
NEXT_PUBLIC_ZEMBED_API_URL=<your-zembed-api-url>
```

### Local Testing Without AWS Access

If you don't have access to upload modules to AWS or want to test modules locally, you can serve them from the Next.js public directory.

#### Setup Local Module Directory

1. Create the following directory structure in the `public` folder (this is gitignored):

```
public/
  zembed/
    v1/
      zembed-bootstraper.mjs
    modules/
      YourModule/
        v1/
          YourModule.js
          YourModule.css
```

2. Obtain the module files from your module development environment or from another developer

3. Update your `.env.development.local` to point to the local server:

```bash
NEXT_PUBLIC_ZEMBED_CDN_URL=http://localhost:3000/zembed
NEXT_PUBLIC_ZEMBED_API_URL=<your-api-url>
```

#### Selective Local Module Testing

If you only want to test specific modules locally while using production CDN for others, you can update the URLs directly in the manifest configuration at `src/pages/api/manifests/index.ts`:

```typescript
const manifests: Config[] = [
    {
        manifest: {
            module: 'order-entry',
            version: '1.0.0',
            assets: {
                // Use local version for this module
                css: [
                    'http://localhost:3000/modules/OrderEntry/v1/OrderEntryModule.css',
                ],
                js: [
                    'http://localhost:3000/modules/OrderEntry/v1/OrderEntryModule.js',
                ],
            },
        },
    },
    {
        manifest: {
            module: 'another-module',
            version: '1.0.0',
            assets: {
                // Use production CDN for this module
                css: [
                    `${process.env.NEXT_PUBLIC_ZEMBED_CDN_URL}/modules/AnotherModule/v1/AnotherModule.css`,
                ],
                js: [
                    `${process.env.NEXT_PUBLIC_ZEMBED_CDN_URL}/modules/AnotherModule/v1/AnotherModule.js`,
                ],
            },
        },
    },
];
```

This approach allows you to:

-   Test local module changes without affecting other modules
-   Mix local and production modules in the same development session
-   Avoid needing AWS credentials for local development

**Note:** The `public/zembed/` directory is gitignored, so you'll need to set this up on each machine where you want to test locally.

### Complete Example

See `/apps/ops/src/pages/customers/[customerId]/order-entry/[transactionId]/index.tsx:23-56` for a complete working example of the Order Entry embedded component implementation.

### Key Points

-   **Module Names**: The module name in `zembedConfig.modules` must match the `module` field in the manifest configuration
-   **Access Token**: Always pass the access token as a callback function, not as a direct value
-   **Custom Elements**: ZEmbed components are rendered as custom web components (e.g., `<zen-order-entry>`)
-   **Data Attributes**: Pass props to embedded components using `data-*` attributes
-   **Error Handling**: Always check the `success` and `error` values returned by `useZEmbedInit`
-   **Debug Mode**: Set `debug: true` in development to see detailed logging from ZEmbed
