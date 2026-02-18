import '@testing-library/jest-dom/vitest';

import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './mocks/server';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test (to remove any test-specific overrides)
afterEach(() => server.resetHandlers());

// Stop MSW server after all tests
afterAll(() => server.close());
