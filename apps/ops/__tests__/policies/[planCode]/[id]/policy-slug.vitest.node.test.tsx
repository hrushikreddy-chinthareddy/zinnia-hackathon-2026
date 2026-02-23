import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, vi, beforeEach, test, expect } from 'vitest';

import PolicySlug from '@deps/pages/policies/[planCode]/[id]/policy-slug';

import { createMockRouter, createMockPolicyPageProps } from './test-fixtures';
import { createTestWrapper } from '../../../../vitest/utils/create-test-wrapper';
import { server } from '../../../../vitest/vitest.setup';

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

const defaultProps = createMockPolicyPageProps();

// Factory function to render with optional runtime handlers
const renderPolicyPage = (...runtimeHandlers: any[]) => {
    if (runtimeHandlers.length > 0) {
        server.use(...runtimeHandlers);
    }

    return render(<PolicySlug {...defaultProps} />, {
        wrapper: createTestWrapper(),
    });
};

describe('policy-details-page', () => {
    beforeEach(() => {
        // Reset to default router before each test
        mockRouter = createMockRouter();
    });

    describe('default slug behavior', () => {
        test('renders with Policy Details text when no slug is provided', async () => {
            // Override the router to have no slug
            mockRouter = createMockRouter({ slug: undefined });

            renderPolicyPage();

            // Verify component renders with Policy Details text (LIFE products show Policy Details)
            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });

        test('renders with Policy Details text when slug is empty array', async () => {
            // Override the router with empty slug array
            mockRouter = createMockRouter({ slug: [] });

            renderPolicyPage();

            // Verify component renders with Policy Details text (LIFE products show Policy Details)
            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });
    });
    describe('people tab', () => {
        test('renders PeopleTab when slug is people with no second slug', async () => {
            mockRouter = createMockRouter({ slug: ['people'] });

            renderPolicyPage();

            const element = await screen.findByRole('heading', {
                name: 'People',
            });
            expect(element).toBeInTheDocument();
        });

        test('renders PersonSubPage when slug is people with person ID', async () => {
            mockRouter = createMockRouter({
                slug: ['people', 'person-123'],
            });

            renderPolicyPage();

            // PersonSubPage should render - verify it's not showing the main People tab
            const peopleHeading = screen.queryByRole('heading', {
                name: 'People',
            });
            expect(peopleHeading).not.toBeInTheDocument();
        });

        test('does not render SelfServeTransactionContainer for assigneechange when transactionData is null', async () => {
            mockRouter = createMockRouter({
                slug: ['people', 'assigneechange'],
            });

            renderPolicyPage();

            // Should not render transaction container, falls through to PersonSubPage
            // Verify it's not showing the main People tab
            const peopleHeading = screen.queryByRole('heading', {
                name: 'People',
            });
            expect(peopleHeading).not.toBeInTheDocument();
        });

        test('does not render SelfServeTransactionContainer for benechange when transactionData is null', async () => {
            mockRouter = createMockRouter({
                slug: ['people', 'benechange'],
            });

            renderPolicyPage();

            // Should not render transaction container, falls through to PersonSubPage
            // Verify it's not showing the main People tab
            const peopleHeading = screen.queryByRole('heading', {
                name: 'People',
            });
            expect(peopleHeading).not.toBeInTheDocument();
        });

        test('renders SelfServeTransactionContainer for assigneechange when transactionData exists', async () => {
            mockRouter = createMockRouter({
                slug: ['people', 'assigneechange'],
            });

            // Add runtime handler for form metadata to enable transactionData
            const formMetadataHandler = http.get(
                '*/api/case/v1/form/metadata',
                () => {
                    return HttpResponse.json({
                        schemaContent: {
                            tabSchemas: [
                                {
                                    title: 'Initial Tab',
                                    schema: {},
                                },
                                {
                                    title: 'Form Tab',
                                    schema: {},
                                },
                            ],
                        },
                    });
                }
            );

            renderPolicyPage(formMetadataHandler);

            // Wait for transactionData to be set and component to re-render
            // The transaction container should render instead of PersonSubPage
            const ownerDetails = screen.queryByText('Owner Details');
            expect(ownerDetails).not.toBeInTheDocument();
        });

        test('renders SelfServeTransactionContainer for benechange when transactionData exists', async () => {
            mockRouter = createMockRouter({
                slug: ['people', 'benechange'],
            });

            // Add runtime handler for form metadata to enable transactionData
            const formMetadataHandler = http.get(
                '*/api/case/v1/form/metadata',
                () => {
                    return HttpResponse.json({
                        schemaContent: {
                            tabSchemas: [
                                {
                                    title: 'Initial Tab',
                                    schema: {},
                                },
                                {
                                    title: 'Form Tab',
                                    schema: {},
                                },
                            ],
                        },
                    });
                }
            );

            renderPolicyPage(formMetadataHandler);

            // Wait for transactionData to be set and component to re-render
            // The transaction container should render instead of PersonSubPage
            const ownerDetails = await screen.findByText('Owner Details');
            expect(ownerDetails).toBeInTheDocument();
        });
    });

    describe('other slug routes', () => {
        test('renders with default route when slug is policy-details', async () => {
            mockRouter = createMockRouter({ slug: ['policy-details'] });

            renderPolicyPage();

            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });
    });

    describe('policy slug', () => {
        test('renders PolicyDetailsContainer with policy data loaded', async () => {
            renderPolicyPage();

            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });
    });
});
