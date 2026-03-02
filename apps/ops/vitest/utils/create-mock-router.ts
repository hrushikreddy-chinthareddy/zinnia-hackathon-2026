import { vi } from 'vitest';

import type { NextRouter } from 'next/router';

interface CreateMockRouterOptions {
    query?: NextRouter['query'];
    pathname?: string;
    route?: string;
    asPath?: string;
}

/**
 * Generic factory function to create a mock Next.js router
 * All router properties can be customized via options
 */
export const createMockRouter = (
    options: CreateMockRouterOptions = {}
): Partial<NextRouter> => {
    const { query = {}, pathname = '/', route = '/', asPath = '/' } = options;

    return {
        query,
        pathname,
        route,
        asPath,
        isReady: true,
        push: vi.fn(),
        replace: vi.fn(),
        events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
        basePath: '',
        isFallback: false,
        isLocaleDomain: false,
        isPreview: false,
    };
};
