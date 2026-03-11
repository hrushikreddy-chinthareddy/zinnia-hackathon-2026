import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, vi, beforeEach, test, expect } from 'vitest';

import PolicySlug from '@deps/containers/policy-slug/policy-slug';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    activityTransactionsHandler,
    documentsHandlers,
    fundsEligibilityHandlers,
    personEligibilityHandlers,
} from '@vitest/helpers/policy/shared/policy-msw-handlers';
import {
    createMockRouter,
    createMockPolicyPageProps,
} from '@vitest/helpers/policy/shared/policy-test-fixtures';
import { server } from '@vitest/mocks/node';
import policyEndpointData from '@vitest/mocks/policyPage/policyEndpointData.json';
import {
    createTestWrapper,
    CreateTestWrapperOptions,
} from '@vitest/utils/create-test-wrapper';

let mockRouter = createMockRouter();

vi.mock('next/router', () => ({
    useRouter: () => mockRouter,
    // Custom404Page uses `import router from 'next/router'` to read router.query which needs a default export
    default: {
        query: {},
        push: () => Promise.resolve(true),
        replace: () => Promise.resolve(true),
        prefetch: () => Promise.resolve(),
        back: () => {},
    },
}));

const defaultProps = createMockPolicyPageProps();

type FeatureFlagOverrides = CreateTestWrapperOptions['featureFlags'];

// Factory function to render with optional MSW handlers and optional feature flag overrides
const renderPolicyPage = (
    handlers: Parameters<typeof server.use> = [],
    featureFlags: FeatureFlagOverrides = {}
) => {
    if (handlers.length > 0) {
        server.use(...handlers);
    }

    return render(<PolicySlug {...defaultProps} />, {
        wrapper: createTestWrapper({ featureFlags }),
    });
};

describe('Policy Slug Page', () => {
    beforeEach(() => {
        mockRouter = createMockRouter();
    });
    describe('route guard', () => {
        test('renders Custom404Page when the policy API returns an error', async () => {
            server.use(
                http.get('*/api/policies/:planCode/:policyId', () =>
                    HttpResponse.json({}, { status: 500 })
                )
            );

            renderPolicyPage();

            expect(
                await screen.findByText('Page Not Found')
            ).toBeInTheDocument();
        });

        test('renders Custom404Page when the policy API returns no data', async () => {
            server.use(
                http.get('*/api/policies/:planCode/:policyId', () =>
                    HttpResponse.json({ data: null })
                )
            );

            renderPolicyPage();

            expect(
                await screen.findByText('Page Not Found')
            ).toBeInTheDocument();
        });

        test.each([
            { slug: ['policy', 'coverage'] },
            { slug: ['policy', 'loans'] },
        ])(
            'renders Custom404Page when an annuity policy accesses the $slug.0/$slug.1 route',
            async ({ slug }) => {
                server.use(
                    http.get(
                        '*/api/policies/:planCode/:policyId',
                        ({ params }) =>
                            HttpResponse.json({
                                data: {
                                    ...policyEndpointData,
                                    policyNumber: String(
                                        params.policyId ?? 'POL123'
                                    ),
                                    product: {
                                        ...policyEndpointData.product,
                                        planCode: String(
                                            params.planCode ?? 'PLAN1'
                                        ),
                                        lineOfBusiness: 'ANNUITY',
                                    },
                                },
                            })
                    )
                );
                mockRouter = createMockRouter({ slug });

                renderPolicyPage();

                expect(
                    await screen.findByText('Page Not Found')
                ).toBeInTheDocument();
            }
        );
    });
    describe('default route fallback', () => {
        test.each([
            { slug: ['unknown-route'], label: 'unknown slug' },
            { slug: undefined as unknown as string[], label: 'no slug' },
            { slug: [] as string[], label: 'empty slug array' },
        ])('renders PolicyDetailsContainer for $label', async ({ slug }) => {
            mockRouter = createMockRouter({ slug });
            renderPolicyPage();

            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });
    });

    describe('people route, when first slug is people', () => {
        test('renders generic PersonSubpage second slug of PartyId', async () => {
            mockRouter = createMockRouter({ slug: ['people'] });

            renderPolicyPage();

            const element = await screen.findByRole('heading', {
                name: 'People',
            });
            expect(element).toBeInTheDocument();
        });

        test('renders specific PersonSubpage when second slug is a PartyId other than assigneechange and benechange', async () => {
            // Use actual owner partyId from mock data (Sam Mathew)
            mockRouter = createMockRouter({
                slug: ['people', '0a2b5d2279f34fc49b6de65739f14985'],
            });

            renderPolicyPage(personEligibilityHandlers);
            const personHeading = await screen.findByRole('heading', {
                name: 'Sam Mathew',
            });
            expect(personHeading).toBeInTheDocument();

            // Should show Identification card
            const identificationHeading = await screen.findByRole('heading', {
                name: 'Identification',
            });
            expect(identificationHeading).toBeInTheDocument();
        });
        test('renders nothing when second slug is assigneechange IF transactionData is null', async () => {
            //Mocking this because I'm not sure of another way to get transactionData to be null since as of now it's automocked otherwise
            vi.doMock(
                '@deps/containers/self-serve-transaction/self-serve-transaction.helpers',
                () => ({
                    getSelfServeTransactionData: vi
                        .fn()
                        .mockResolvedValue(null),
                })
            );

            mockRouter = createMockRouter({
                slug: ['people', 'assigneechange'],
            });

            renderPolicyPage();

            // Wait for policy layout to load
            await screen.findByTestId('quick-links');

            // Not sure how to test this, but it seems no sub-page content should render while transactionData is null
            expect(
                screen.queryByText('Identification')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole('heading', { name: 'Assignee Details' })
            ).not.toBeInTheDocument();
        });
        test('renders nothing for benechange when second slug is benechange IF transactionData is null', async () => {
            //Mocking this because I'm not sure of another way to get transactionData to be null since as of now it's automocked otherwise
            vi.doMock(
                '@deps/containers/self-serve-transaction/self-serve-transaction.helpers',
                () => ({
                    getSelfServeTransactionData: vi
                        .fn()
                        .mockResolvedValue(null),
                })
            );

            mockRouter = createMockRouter({
                slug: ['people', 'benechange'],
            });

            renderPolicyPage();

            // Wait for policy layout to load
            await screen.findByTestId('quick-links');

            // Not sure how to test this, but it seems no sub-page content should render while transactionData is null
            expect(
                screen.queryByText('Identification')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole('heading', { name: 'Owner Details' })
            ).not.toBeInTheDocument();
        });
        test('renders SelfServeTransactionContainer for assigneechange when second slug is assigneechange AND transactionData exists', async () => {
            // Use actual beneficiary partyId from mock data (Sarah Mathew with 100% allocation)
            mockRouter = createMockRouter({
                slug: ['people', 'assigneechange'],
            });

            renderPolicyPage(personEligibilityHandlers);

            // Verify Beneficiary Details card renders (shows for transaction page)
            const beneficiaryDetailsHeading = await screen.findByRole(
                'heading',
                {
                    name: 'Assignee Details',
                }
            );
            expect(beneficiaryDetailsHeading).toBeInTheDocument();
        });

        test('renders SelfServeTransactionContainer for benechange when second slug is benechange AND transactionData exists', async () => {
            // Use actual beneficiary partyId from mock data (Sarah Mathew with 100% allocation)
            mockRouter = createMockRouter({
                slug: ['people', 'benechange'],
            });

            renderPolicyPage(personEligibilityHandlers);

            // Verify Beneficiary Details card renders (shows for transaction page)
            const beneficiaryDetailsHeading = await screen.findByRole(
                'heading',
                {
                    name: 'Owner Details',
                }
            );
            expect(beneficiaryDetailsHeading).toBeInTheDocument();
        });

        test('renders PersonSubPage when second slug is a PartyId that is neither Beneficiary nor Asignee', async () => {
            // Use actual beneficiary partyId from mock data (Sarah Mathew with 100% allocation)
            mockRouter = createMockRouter({
                slug: ['people', 'c8a283b5d8d540a29fe71aad239c0352'],
            });

            renderPolicyPage(personEligibilityHandlers);

            // Wait for PersonSubPage to load by checking for Identification card
            await screen.findByRole('heading', { name: 'Identification' });

            // Verify Allocation card renders (only shows for beneficiaries)
            const allocationHeading = await screen.findByRole('heading', {
                name: 'Allocation',
            });
            expect(allocationHeading).toBeInTheDocument();

            // Verify beneficiary name is shown
            const beneficiaryName = screen.getByRole('heading', {
                name: 'Sarah Mathew',
            });
            expect(beneficiaryName).toBeInTheDocument();
        });
    });

    describe('sub-page routing', () => {
        // Routes that don't require additional MSW handlers
        test.each([
            { slug: ['policy', 'coverage'], heading: 'Base Coverage' },
            { slug: ['policy', 'policy-details'], heading: 'Policy Details' },
            {
                slug: ['policy', 'riders-and-features'],
                heading: 'Riders and Features',
            },
            {
                slug: ['policy', 'policy-extras'],
                heading: 'Riders and Features',
            },
            { slug: ['policy', 'premiums'], heading: 'Premiums' },
            { slug: ['policy', 'withdrawals'], heading: 'Withdrawals' },
            { slug: ['policy', 'loans'], heading: 'Loans' },
            {
                slug: ['policy', 'annuitization'],
                heading: 'Annuitization and Payout',
            },
            { slug: ['transactions', 'coverage'], heading: 'Base Coverage' },
            {
                slug: ['transactions', 'policy-details'],
                heading: 'Policy Details',
            },
            {
                slug: ['transactions', 'riders-and-features'],
                heading: 'Riders and Features',
            },
            {
                slug: ['transactions', 'policy-extras'],
                heading: 'Riders and Features',
            },
            { slug: ['transactions', 'premiums'], heading: 'Premiums' },
            { slug: ['transactions', 'withdrawals'], heading: 'Withdrawals' },
            { slug: ['transactions', 'loans'], heading: 'Loans' },
            {
                slug: ['transactions', 'annuitization'],
                heading: 'Annuitization and Payout',
            },
        ])(
            'renders correct sub-page for $slug.0/$slug.1',
            async ({ slug, heading: expectedHeading }) => {
                mockRouter = createMockRouter({ slug });
                renderPolicyPage();

                const heading = await screen.findByRole('heading', {
                    name: expectedHeading,
                });
                expect(heading).toBeInTheDocument();
            }
        );

        // Requires fund transfer/allocation eligibility and fund data handlers
        test('renders FundsSubPage for policy/funds', async () => {
            mockRouter = createMockRouter({ slug: ['policy', 'funds'] });
            renderPolicyPage(fundsEligibilityHandlers);

            const heading = await screen.findByRole('heading', {
                name: 'Funds and Accounts',
            });
            expect(heading).toBeInTheDocument();
        });

        test('renders FundsSubPage for transactions/funds', async () => {
            mockRouter = createMockRouter({ slug: ['transactions', 'funds'] });
            renderPolicyPage(fundsEligibilityHandlers);

            const heading = await screen.findByRole('heading', {
                name: 'Funds and Accounts',
            });
            expect(heading).toBeInTheDocument();
        });

        // Uses findByText because the heading is not rendered with a heading role
        test('renders AnnuitizationSubPage for policy/annuitization', async () => {
            mockRouter = createMockRouter({
                slug: ['policy', 'annuitization'],
            });
            renderPolicyPage();

            const heading = await screen.findByText('Annuitization and Payout');
            expect(heading).toBeInTheDocument();
        });
    });

    describe('activity route', () => {
        test('renders FilterTransactions for activity/transactions when REVISED_HISTORY_TABLE flag is on', async () => {
            mockRouter = createMockRouter({
                slug: ['activity', 'transactions'],
            });
            renderPolicyPage([activityTransactionsHandler], {
                [FEATURE_FLAGS.REVISED_HISTORY_TABLE]: true,
            });
            const heading = await screen.findByRole('heading', {
                name: 'Transactions',
            });
            expect(heading).toBeInTheDocument();
        });

        test('renders CallLogs for activity/call-logs when REVISED_HISTORY_TABLE flag is on', async () => {
            mockRouter = createMockRouter({ slug: ['activity', 'call-logs'] });
            renderPolicyPage([], {
                [FEATURE_FLAGS.REVISED_HISTORY_TABLE]: true,
            });
            const heading = await screen.findByRole('heading', {
                name: 'Call logs',
            });
            expect(heading).toBeInTheDocument();
        });
    });

    describe('documents route', () => {
        test('renders DocumentsSubPage for documents', async () => {
            mockRouter = createMockRouter({ slug: ['documents'] });
            renderPolicyPage(documentsHandlers);

            const heading = await screen.findByRole('heading', {
                name: 'Documents',
            });
            expect(heading).toBeInTheDocument();
        });
    });
});
