import { vi } from 'vitest';

import type { NextRouter } from 'next/router';

/**
 * Factory function to create a mock Next.js router with custom query params
 */
export const createMockRouter = (
    queryOverrides: Partial<NextRouter['query']> = {}
): Partial<NextRouter> => {
    const query = {
        id: 'POL123',
        planCode: 'PLAN1',
        slug: ['policy-details'],
        ...queryOverrides,
    };

    return {
        query,
        pathname: '/policies/[planCode]/[id]/[...slug]',
        asPath: `/policies/${query.planCode}/${query.id}${
            query.slug
                ? `/${
                      Array.isArray(query.slug)
                          ? query.slug.join('/')
                          : query.slug
                  }`
                : ''
        }`,
        isReady: true,
        push: vi.fn(),
        replace: vi.fn(),
        events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
        route: '/policies/[planCode]/[id]/[...slug]',
        basePath: '',
        isFallback: false,
        isLocaleDomain: false,
        isPreview: false,
    };
};

/**
 * Default user object for testing
 */
export const createMockUser = (overrides = {}) => ({
    nickname: 'testuser',
    name: 'Test User',
    picture: '',
    updated_at: '',
    email: 'test@example.com',
    email_verified: true,
    sid: 'session-123',
    sub: 'auth0|123',
    partyId: 'party-123',
    user_metadata: { communication_mode: 'email' },
    app_metadata: { company: 'TestCo' },
    ...overrides,
});

/**
 * Default props for policy page components
 */
export const createMockPolicyPageProps = (overrides = {}) => ({
    subPageTitleKey: 'policyDetails',
    policy: {} as any,
    permissions: {} as any,
    user: createMockUser(),
    ...overrides,
});
