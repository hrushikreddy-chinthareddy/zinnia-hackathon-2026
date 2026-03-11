import { PolicySearchResult } from '@deps/types/search';
import { createMockRouter as createGenericMockRouter } from '@vitest/utils/create-mock-router';

import type { NextRouter } from 'next/router';


/**
 * Default query parameters for policy index page tests
 */
export const DEFAULT_POLICY_INDEX_QUERY: NextRouter['query'] = {};

/**
 * Factory to create a mock router targeting the policy index page.
 */
export const createMockRouter = (
    queryOverrides: Partial<NextRouter['query']> = {}
): Partial<NextRouter> => {
    const query = {
        ...DEFAULT_POLICY_INDEX_QUERY,
        ...queryOverrides,
    };

    const asPath = '/policies';

    return createGenericMockRouter({
        query,
        pathname: '/policies',
        route: '/policies',
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

// ────────────────────────────────────────────────────────────────────────────
// Mock policy search results
// ────────────────────────────────────────────────────────────────────────────

export const mockPolicySearchResults: PolicySearchResult[] = [
    {
        carrierId: 'SBLI',
        companyName: 'SBLI',
        firstName: 'Jane',
        lastName: 'Doe',
        id: 'result-1',
        lastUpdated: '2024-06-15T12:00:00Z',
        lineOfBusiness: 'LIFE',
        partyIds: ['party-1', 'party-2'],
        planCode: 'PLAN1',
        policyNumber: 'POL100001',
        policyStatus: 'Active',
        productName: 'Whole Life Gold',
        productType: 'WHOLELIFE',
        source: 'zahara',
        ssn: '123-45-6789',
        agentSsn: '987-65-4321',
    },
    {
        carrierId: 'WCL',
        companyName: 'WCL',
        firstName: 'John',
        lastName: 'Smith',
        id: 'result-2',
        lastUpdated: '2024-05-20T08:30:00Z',
        lineOfBusiness: 'ANNUITY',
        partyIds: ['party-3', 'party-4'],
        planCode: 'PLAN2',
        policyNumber: 'POL200002',
        policyStatus: 'Active',
        productName: 'Fixed Indexed Annuity',
        productType: 'FIXEDINDEXEDANNUITY',
        source: 'zahara',
        ssn: '222-33-4444',
        agentSsn: '555-66-7777',
    },
    {
        carrierId: 'SBLI',
        companyName: 'SBLI',
        firstName: 'Alice',
        lastName: 'Johnson',
        id: 'result-3',
        lastUpdated: '2024-04-10T16:45:00Z',
        lineOfBusiness: 'LIFE',
        partyIds: ['party-5', 'party-6'],
        planCode: 'PLAN3',
        policyNumber: 'POL300003',
        policyStatus: 'Lapsed',
        productName: 'Term Life 20',
        productType: 'TERM',
        source: 'zahara',
        ssn: '333-22-1111',
        agentSsn: '111-22-3333',
    },
];
