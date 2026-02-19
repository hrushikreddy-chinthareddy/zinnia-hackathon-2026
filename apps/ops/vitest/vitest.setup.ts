import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers.js';
import { beforeAll, afterEach, afterAll } from 'vitest';

const server = setupServer(...handlers);

// Start MSW server before all tests
beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test (to remove any test-specific overrides)
afterEach(() => {
    server.resetHandlers();
});

// Stop MSW server after all tests
afterAll(() => {
    server.close();
});
