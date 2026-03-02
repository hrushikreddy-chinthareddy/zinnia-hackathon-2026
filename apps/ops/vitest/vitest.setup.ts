import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';

import { server } from './mocks/node';

// Global mock for next-i18next
// Delegate to react-i18next for useTranslation so it reads from I18nextProvider,
// and also export i18n for components that import it directly
vi.mock('next-i18next', async () => {
    const reactI18next = await import('react-i18next');
    return {
        useTranslation: reactI18next.useTranslation,
        Trans: reactI18next.Trans,
        i18n: {
            language: 'en',
            changeLanguage: vi.fn(),
            languages: ['en'],
            options: {},
            t: (key: string) => key,
        },
        I18n: class {
            t = (key: string) => key;
        },
    };
});

// Mock ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

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
