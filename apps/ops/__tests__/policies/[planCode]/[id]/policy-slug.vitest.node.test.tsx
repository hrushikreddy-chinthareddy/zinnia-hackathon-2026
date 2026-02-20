import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, vi, beforeEach, test, expect } from 'vitest';

import PolicyDetailsPage from '@deps/pages/policies/[planCode]/[id]/policy-slug';

import { mockPolicyData } from '../../../../vitest/mocks/handlers';
import { createTestWrapper } from '../../../../vitest/utils/create-test-wrapper';
import { server } from '../../../../vitest/vitest.setup';

import type { NextRouter } from 'next/router';

// Factory function to create a mock router with custom query params
const createMockRouter = (
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

let mockRouter = createMockRouter();

vi.mock('next/router', () => ({
    useRouter: () => mockRouter,
}));

// next-i18next uses its own i18next instance in non-Next.js environments;
// delegate to react-i18next so it reads from I18nextProvider instead.
vi.mock('next-i18next', async () => {
    const { useTranslation } = await import('react-i18next');
    return { useTranslation };
});

const defaultProps = {
    subPageTitleKey: 'policyDetails',
    policy: {} as any,
    permissions: {} as any,
    user: {
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
    } as any,
};

// Factory function to render with optional runtime handlers
const renderPolicyPage = (...runtimeHandlers: any[]) => {
    if (runtimeHandlers.length > 0) {
        server.use(...runtimeHandlers);
    }

    return render(<PolicyDetailsPage {...defaultProps} />, {
        wrapper: createTestWrapper(),
    });
};

describe('policy-details-page', () => {
    beforeEach(() => {
        // Reset to default router before each test
        mockRouter = createMockRouter();
    });

    describe('default slug behavior', () => {
        test('renders PolicyDetailsContainer when no slug is provided', async () => {
            // Override the router to have no slug
            mockRouter = createMockRouter({ slug: undefined });

            renderPolicyPage();

            // Verify PolicyDetailsContainer is rendered
            const element = await screen.findByText('Contract Details');
            expect(element).toBeInTheDocument();
        });

        test('renders PolicyDetailsContainer when slug is empty array', async () => {
            // Override the router with empty slug array
            mockRouter = createMockRouter({ slug: [] });

            renderPolicyPage();

            // Verify PolicyDetailsContainer is rendered
            const element = await screen.findByText('Contract Details');
            expect(element).toBeInTheDocument();
        });

        test('renders with Policy Details text when no slug is provided', async () => {
            // Override the router to have no slug
            mockRouter = createMockRouter({ slug: undefined });

            renderPolicyPage(
                http.get('*/api/policies/:planCode/:policyId', () => {
                    return HttpResponse.json({ data: mockPolicyData });
                })
            );

            // Verify component renders with Policy Details text (LIFE products show Policy Details)
            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });

        test('renders with Policy Details text when slug is empty array', async () => {
            // Override the router with empty slug array
            mockRouter = createMockRouter({ slug: [] });

            renderPolicyPage(
                http.get('*/api/policies/:planCode/:policyId', () => {
                    return HttpResponse.json({ data: mockPolicyData });
                })
            );

            // Verify component renders with Policy Details text (LIFE products show Policy Details)
            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });
    });

    describe('policy slug', () => {
        test('renders PolicyDetailsContainer with policy data loaded', async () => {
            renderPolicyPage(
                http.get('*/api/policies/:planCode/:policyId', () => {
                    return HttpResponse.json({ data: mockPolicyData });
                })
            );

            // Verify PolicyDetailsContainer is rendered with data (LIFE products show Policy Details)
            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });
    });
});
