import { test as testBase } from 'vitest';

import { server } from './mocks/server';

type TestContext = {
    server: typeof server;
};

export const test = testBase.extend<TestContext>({
    server: [
        async ({}, use) => {
            // Expose the server object on the test's context
            // (server lifecycle is managed by vitest/setup.ts)
            await use(server);
        },
        {
            auto: true,
        },
    ],
});
