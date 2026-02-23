import { createMockRouter as createGenericMockRouter } from '../../../../vitest/utils/create-mock-router';

import type { NextRouter } from 'next/router';

/**
 * Default query parameters for policy page tests
 */
export const DEFAULT_POLICY_QUERY = {
    id: 'POL123',
    planCode: 'PLAN1',
    slug: ['policy-details'],
};

/**
 * Factory function to create a mock router for policy pages with custom query params
 */
export const createMockRouter = (
    queryOverrides: Partial<NextRouter['query']> = {}
): Partial<NextRouter> => {
    const query = {
        ...DEFAULT_POLICY_QUERY,
        ...queryOverrides,
    };

    const slugPath = query.slug
        ? `/${Array.isArray(query.slug) ? query.slug.join('/') : query.slug}`
        : '';
    const asPath = `/policies/${query.planCode}/${query.id}${slugPath}`;

    return createGenericMockRouter({
        query,
        pathname: '/policies/[planCode]/[id]/[...slug]',
        route: '/policies/[planCode]/[id]/[...slug]',
        asPath,
    });
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
