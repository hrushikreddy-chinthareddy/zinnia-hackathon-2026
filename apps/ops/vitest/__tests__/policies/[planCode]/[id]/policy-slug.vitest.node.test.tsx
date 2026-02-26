import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, vi, beforeEach, test, expect } from 'vitest';

import PolicySlug from '@deps/containers/policy-slug/policy-slug';
import { server } from '@vitest/mocks/node';
import policyEndpointData from '@vitest/mocks/policyPage/policyEndpointData.json';
import { createTestWrapper } from '@vitest/utils/create-test-wrapper';

import {
    documentsHandlers,
    formMetadataHandler,
    fundsEligibilityHandlers,
    personEligibilityHandlers,
} from './helpers/policy-msw-handlers';
import {
    createMockRouter,
    createMockPolicyPageProps,
} from './helpers/policy-test-fixtures';

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
        mockRouter = createMockRouter();
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
            // Use actual owner partyId from mock data (Sam Mathew)
            mockRouter = createMockRouter({
                slug: ['people', '0a2b5d2279f34fc49b6de65739f14985'],
            });

            renderPolicyPage(...personEligibilityHandlers);

            // PersonSubPage should render with the person's name
            const personHeading = await screen.findByRole('heading', {
                name: 'Sam Mathew',
            });
            expect(personHeading).toBeInTheDocument();

            // Should show Identification card
            const identificationHeading = await screen.findByText(
                'Identification'
            );
            expect(identificationHeading).toBeInTheDocument();
        });
        test('renders nothing for assigneechange when transactionData is null', async () => {
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

            // No sub-page content should render while transactionData is null
            expect(
                screen.queryByText('Identification')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole('heading', { name: 'Assignee Details' })
            ).not.toBeInTheDocument();
        });
        test('renders nothing for benechange when transactionData is null', async () => {
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

            // No sub-page content should render while transactionData is null
            expect(
                screen.queryByText('Identification')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByRole('heading', { name: 'Owner Details' })
            ).not.toBeInTheDocument();
        });
        test('renders SelfServeTransactionContainer for assigneechange when transactionData exists', async () => {
            // Use actual beneficiary partyId from mock data (Sarah Mathew with 100% allocation)
            mockRouter = createMockRouter({
                slug: ['people', 'assigneechange'],
            });

            renderPolicyPage(formMetadataHandler, ...personEligibilityHandlers);

            // Verify Beneficiary Details card renders (shows for transaction page)
            const beneficiaryDetailsHeading = await screen.findByRole(
                'heading',
                {
                    name: 'Assignee Details',
                }
            );
            expect(beneficiaryDetailsHeading).toBeInTheDocument();
        });

        test('renders SelfServeTransactionContainer for benechange when transactionData exists', async () => {
            // Use actual beneficiary partyId from mock data (Sarah Mathew with 100% allocation)
            mockRouter = createMockRouter({
                slug: ['people', 'benechange'],
            });

            renderPolicyPage(formMetadataHandler, ...personEligibilityHandlers);

            // Verify Beneficiary Details card renders (shows for transaction page)
            const beneficiaryDetailsHeading = await screen.findByRole(
                'heading',
                {
                    name: 'Owner Details',
                }
            );
            expect(beneficiaryDetailsHeading).toBeInTheDocument();
        });

        test('renders PersonSubPage when Party is neither Beneficiary nor Asignee', async () => {
            // Use actual beneficiary partyId from mock data (Sarah Mathew with 100% allocation)
            mockRouter = createMockRouter({
                slug: ['people', 'c8a283b5d8d540a29fe71aad239c0352'],
            });

            renderPolicyPage(formMetadataHandler, ...personEligibilityHandlers);

            // Wait for PersonSubPage to load by checking for Identification card
            await screen.findByText('Identification');

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
            { slug: ['transactions', 'coverage'], heading: 'Base Coverage' },
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
            { slug: ['activity'], heading: 'Activity' },
        ])(
            'renders correct sub-page for $slug',
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
            renderPolicyPage(...fundsEligibilityHandlers);

            const heading = await screen.findByRole('heading', {
                name: 'Funds and Accounts',
            });
            expect(heading).toBeInTheDocument();
        });

        // Requires document search API handler
        test('renders DocumentsSubPage for documents', async () => {
            mockRouter = createMockRouter({ slug: ['documents'] });
            renderPolicyPage(...documentsHandlers);

            const heading = await screen.findByRole('heading', {
                name: 'Documents',
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

        // Fallback: unrecognized, undefined, or empty slugs render the default PolicyDetailsContainer
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

    describe('guard: error, missing policy, and annuity forbidden page', () => {
        test('renders Custom404Page when the policy API returns an error', async () => {
            server.use(
                http.get('*/api/policies/:planCode/:policyId', () =>
                    HttpResponse.json({}, { status: 500 })
                )
            );

            renderPolicyPage();

            await screen.findByText('Page Not Found');
        });

        test('renders Custom404Page when the policy API returns no data', async () => {
            server.use(
                http.get('*/api/policies/:planCode/:policyId', () =>
                    HttpResponse.json({ data: null })
                )
            );

            renderPolicyPage();

            await screen.findByText('Page Not Found');
        });

        test.each([
            { slug: ['policy', 'coverage'] },
            { slug: ['policy', 'loans'] },
        ])(
            'renders Custom404Page for annuity policy on forbidden $slug[1] route',
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

                await screen.findByText('Page Not Found');
            }
        );
    });
});
