import '@testing-library/jest-dom/vitest';
import React from 'react';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers.js';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// next/image resolves SVG imports to empty strings in jsdom; stub it globally
// so any test rendering a carrier logo or other Next.js image doesn't error.
vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) =>
        React.createElement('img', { src: src || 'placeholder', alt, ...props }),
}));

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
