import { render, screen } from '@testing-library/react';
import { createTestWrapper } from '@vitest/utils/create-test-wrapper';
import { server } from '@vitest/vitest.setup';
import { describe, vi, beforeEach, test, expect } from 'vitest';

import PolicySlug from '@deps/pages/policies/[planCode]/[id]/policy-slug';

import {
    documentsHandlers,
    formMetadataHandler,
    fundsEligibilityHandlers,
    personEligibilityHandlers,
} from './eligibility-handlers';
import { createMockRouter, createMockPolicyPageProps } from './test-fixtures';

let mockRouter = createMockRouter();

vi.mock('next/router', () => ({
    useRouter: () => mockRouter,
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

        test.todo(
            'does not render SelfServeTransactionContainer for assigneechange when transactionData is null',
            async () => {
                mockRouter = createMockRouter({
                    slug: ['people', 'assigneechange'],
                });

                renderPolicyPage();

                // Should not render transaction container, falls through to PersonSubPage
                // Verify it's not showing the main People tab
                const asigneeDetail = screen.queryByRole('heading', {
                    name: 'Asignee Details',
                });
                expect(asigneeDetail).not.toBeInTheDocument();
            }
        );

        test.todo(
            'does not render SelfServeTransactionContainer for benechange when transactionData is null',
            async () => {
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
            }
        );

        test.todo(
            'renders SelfServeTransactionContainer for assigneechange when transactionData exists',
            async () => {
                mockRouter = createMockRouter({
                    slug: ['people', 'assigneechange'],
                });

                renderPolicyPage(formMetadataHandler);

                // Wait for transactionData to be set and component to re-render
                // The transaction container should render instead of PersonSubPage
                const ownerDetails = screen.queryByText('Owner Details');
                expect(ownerDetails).not.toBeInTheDocument();
            }
        );

        test.todo(
            'renders SelfServeTransactionContainer for benechange when transactionData exists',
            async () => {
                mockRouter = createMockRouter({
                    slug: ['people', 'benechange'],
                });

                renderPolicyPage(
                    formMetadataHandler,
                    ...personEligibilityHandlers
                );

                // Wait for transactionData to be set and component to re-render
                // PersonSubPage should render with Owner Details for this test
                const ownerDetails = await screen.findByText('Owner Details');
                expect(ownerDetails).toBeInTheDocument();
            }
        );
        test('renders PersonSubPage for assigneechange with eligibility checks', async () => {
            mockRouter = createMockRouter({
                slug: ['people', 'assigneechange'],
            });

            renderPolicyPage(formMetadataHandler, ...personEligibilityHandlers);

            // PersonSubPage should render with Assignee Details when eligibility checks are present
            const assigneeDetails = await screen.findByText('Assignee Details');
            expect(assigneeDetails).toBeInTheDocument();
        });

        test('renders PersonSubPage with Allocation card for beneficiary', async () => {
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

    describe('transactions and policy slug routes', () => {
        test('renders CoverageSubPage when slug is policy/coverage', async () => {
            mockRouter = createMockRouter({ slug: ['policy', 'coverage'] });

            renderPolicyPage();

            const heading = await screen.findByRole('heading', {
                name: 'Base Coverage',
            });
            expect(heading).toBeInTheDocument();
        });

        test('renders CoverageSubPage when slug is transactions/coverage', async () => {
            mockRouter = createMockRouter({
                slug: ['transactions', 'coverage'],
            });

            renderPolicyPage();

            const heading = await screen.findByRole('heading', {
                name: 'Base Coverage',
            });
            expect(heading).toBeInTheDocument();
        });

        test('renders PolicyDetailsContainer when slug is policy/policy-details', async () => {
            mockRouter = createMockRouter({
                slug: ['policy', 'policy-details'],
            });

            renderPolicyPage();

            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });

        test('renders RidersAndFeaturesSubPage when slug is policy/riders-and-features', async () => {
            mockRouter = createMockRouter({
                slug: ['policy', 'riders-and-features'],
            });

            renderPolicyPage();

            const heading = await screen.findByRole('heading', {
                name: 'Riders and Features',
            });
            expect(heading).toBeInTheDocument();
        });

        test('renders RidersAndFeaturesSubPage when slug is policy/policy-extras (backwards compatibility)', async () => {
            mockRouter = createMockRouter({
                slug: ['policy', 'policy-extras'],
            });

            renderPolicyPage();

            const heading = await screen.findByRole('heading', {
                name: 'Riders and Features',
            });
            expect(heading).toBeInTheDocument();
        });

        test('renders FundsSubPage when slug is policy/funds', async () => {
            mockRouter = createMockRouter({ slug: ['policy', 'funds'] });

            renderPolicyPage(...fundsEligibilityHandlers);

            const heading = await screen.findByRole('heading', {
                name: 'Funds and Accounts',
            });
            expect(heading).toBeInTheDocument();
        });

        test('renders PremiumsSubPage when slug is policy/premiums', async () => {
            mockRouter = createMockRouter({ slug: ['policy', 'premiums'] });

            renderPolicyPage();

            const heading = await screen.findByRole('heading', {
                name: 'Premiums',
            });
            expect(heading).toBeInTheDocument();
        });

        test('renders WithdrawalsSubPage when slug is policy/withdrawals', async () => {
            mockRouter = createMockRouter({
                slug: ['policy', 'withdrawals'],
            });

            renderPolicyPage();

            const heading = await screen.findByRole('heading', {
                name: 'Withdrawals',
            });
            expect(heading).toBeInTheDocument();
        });

        test('renders LoansSubPage when slug is policy/loans', async () => {
            mockRouter = createMockRouter({ slug: ['policy', 'loans'] });

            renderPolicyPage();

            const heading = await screen.findByRole('heading', {
                name: 'Loans',
            });
            expect(heading).toBeInTheDocument();
        });

        test('renders AnnuitizationSubPage when slug is policy/annuitization', async () => {
            mockRouter = createMockRouter({
                slug: ['policy', 'annuitization'],
            });

            renderPolicyPage();

            const heading = await screen.findByText('Annuitization and Payout');
            expect(heading).toBeInTheDocument();
        });
    });

    describe('activity slug routes', () => {
        test('renders ActivitySubPage when slug is activity', async () => {
            mockRouter = createMockRouter({ slug: ['activity'] });

            renderPolicyPage();

            const heading = await screen.findByRole('heading', {
                name: 'Activity',
            });
            expect(heading).toBeInTheDocument();
        });
    });

    describe('documents slug routes', () => {
        test('renders DocumentsSubPage when slug is documents', async () => {
            mockRouter = createMockRouter({ slug: ['documents'] });

            renderPolicyPage(...documentsHandlers);

            const heading = await screen.findByRole('heading', {
                name: 'Documents',
            });
            expect(heading).toBeInTheDocument();
        });
    });

    describe('default slug fallback', () => {
        test('renders PolicyDetailsContainer for unknown slug', async () => {
            mockRouter = createMockRouter({ slug: ['unknown-route'] });

            renderPolicyPage();

            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });

        test('renders PolicyDetailsContainer with policy data loaded (no slug)', async () => {
            renderPolicyPage();

            const element = await screen.findByText('Policy Details');
            expect(element).toBeInTheDocument();
        });
    });
});
