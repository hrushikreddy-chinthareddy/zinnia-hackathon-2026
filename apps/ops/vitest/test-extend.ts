import { test as testBase } from 'vitest';

import { worker } from './mocks/brower';

type TestContext = {
    worker: typeof worker;
};

export const test = testBase.extend<TestContext>({
    worker: [
        async ({}, use) => {
            // Start the worker before the test.
            await worker.start();

            // Expose the worker object on the test's context.
            await use(worker);

            // Remove any request handlers added in individual test cases.
            // This prevents them from affecting unrelated tests.
            worker.resetHandlers();

            // Stop the worker after the test.
            worker.stop();
        },
        {
            auto: true,
        },
    ],
});
