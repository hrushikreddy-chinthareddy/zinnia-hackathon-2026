import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll } from 'vitest';

import { handlers } from './mocks/handlers.js';

export const server = setupServer(...handlers);

// Start MSW server before all tests
beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
    server.events.on('request:start', ({ request }) => {
        console.log('Outgoing:', request.method, request.url);
    });
});

// Reset handlers after each test (to remove any test-specific overrides)
afterEach(() => {
    server.resetHandlers();
});

// Stop MSW server after all tests
afterAll(() => {
    server.close();
});
