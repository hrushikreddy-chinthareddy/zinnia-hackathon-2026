import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    test: {
        projects: [
            {
                test: {
                    // an example of file based convention,
                    // you don't have to follow it
                    include: ['**/*.vitest.node.{test,spec}.ts'],
                    name: 'node',
                    environment: 'node',
                },
            },
            {
                test: {
                    include: ['**/*.vitest.browser.{test,spec}.ts'],
                    name: 'browser',
                    browser: {
                        provider: playwright(),
                        enabled: true,
                        instances: [{ browser: 'chromium' }],
                    },
                    globals: true,
                },
            },
        ],
    },
});
