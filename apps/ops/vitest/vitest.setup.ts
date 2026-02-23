import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

import { handlers } from './mocks/handlers.js';

// Global mock for next-i18next
// Delegate to react-i18next so it reads from I18nextProvider instead
vi.mock('next-i18next', async () => {
    const { useTranslation } = await import('react-i18next');
    return { useTranslation };
});

// Mock ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

export const server = setupServer(...handlers);

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
