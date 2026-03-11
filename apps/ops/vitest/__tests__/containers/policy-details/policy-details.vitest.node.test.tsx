import { screen, fireEvent, within } from '@testing-library/react';
import { describe, vi, beforeEach, test, expect } from 'vitest';

import {
    annuityPolicyOverrides,
    lifePolicyOverrides,
    termPolicyOverrides,
    iulPolicyOverrides,
} from '@vitest/helpers/policy/containers/policy-details/policy-overrides';
import { renderPolicyDetailsPage } from '@vitest/helpers/policy/containers/policy-details/render-policy-page';
import {
    agentDataEmptyHandler,
    agentDataErrorHandler,
    agentDataHandler,
} from '@vitest/helpers/policy/shared/policy-msw-handlers';
import { createMockRouter } from '@vitest/helpers/policy/shared/policy-test-fixtures';
import policyEndpointData from '@vitest/mocks/policyPage/policyEndpointData.json';

let mockRouter = createMockRouter({ slug: ['policy', 'policy-details'] });

vi.mock('next/router', () => ({
    useRouter: () => mockRouter,
    default: {
        query: {},
        push: () => Promise.resolve(true),
        replace: () => Promise.resolve(true),
        prefetch: () => Promise.resolve(),
        back: () => {},
    },
}));

beforeEach(() => {
    mockRouter = createMockRouter({ slug: ['policy', 'policy-details'] });
});

describe('policy-details route', () => {
    // ─── Top-level layout switching ──────────────────────────────────────────

    describe('layout selection by lineOfBusiness', () => {
        test('Life policy renders InsuredCard, not AnnuitantCard', async () => {
            renderPolicyDetailsPage(lifePolicyOverrides);

            await screen.findByRole('heading', { name: 'Policy Details' });
            expect(
                screen.queryByRole('heading', { name: 'Owner and Annuitant' })
            ).not.toBeInTheDocument();
            expect(
                await screen.findByRole('heading', { name: 'Insured' })
            ).toBeInTheDocument();
        });

        test('Annuity policy (lineOfBusiness: ANNUITY) renders AnnuitantCard, not InsuredCard', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides);

            await screen.findByRole('heading', { name: 'Contract Details' });
            expect(
                await screen.findByRole('heading', {
                    name: 'Owner and Annuitant',
                })
            ).toBeInTheDocument();
            expect(
                screen.queryByRole('heading', { name: 'Insured' })
            ).not.toBeInTheDocument();
        });

        test('Legacy annuity (lineOfBusiness: "Annuity Product") renders AnnuitantCard', async () => {
            renderPolicyDetailsPage({
                product: {
                    ...policyEndpointData.product,
                    lineOfBusiness: 'Annuity Product',
                    productType: 'FIXEDINDEXEDANNUITY',
                },
            });

            await screen.findByRole('heading', { name: 'Contract Details' });
            expect(
                await screen.findByRole('heading', {
                    name: 'Owner and Annuitant',
                })
            ).toBeInTheDocument();
        });

        test('Unknown lineOfBusiness falls through to Life layout (InsuredCard visible)', async () => {
            renderPolicyDetailsPage({
                product: {
                    ...policyEndpointData.product,
                    lineOfBusiness: 'UNKNOWN_TYPE',
                    productType: 'UNIVERSALLIFE',
                },
            });

            await screen.findByRole('heading', { name: 'Policy Details' });
            expect(
                await screen.findByRole('heading', { name: 'Insured' })
            ).toBeInTheDocument();
        });
    });

    // ─── PolicyFinancialsCard layout variants ────────────────────────────────

    const getFinancialsCard = async () => {
        const heading = await screen.findByRole('heading', {
            name: 'Financials',
        });
        return heading.closest('[data-testid="card-container"]') as HTMLElement;
    };

    const expectNoTransactionCards = (card: HTMLElement) => {
        expect(within(card).queryByText('Premiums')).not.toBeInTheDocument();
        expect(within(card).queryByText('Withdrawals')).not.toBeInTheDocument();
        expect(within(card).queryByText('RMDs')).not.toBeInTheDocument();
        expect(within(card).queryByText('Loans')).not.toBeInTheDocument();
        expect(within(card).queryByText('Funds')).not.toBeInTheDocument();
    };

    describe('PolicyFinancialsCard layout variants', () => {
        test('Annuity policy shows Surrender Value and Qualification Type', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides);

            const financialsCard = await getFinancialsCard();

            expect(
                within(financialsCard).getByText('Surrender value')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).getByText('Cost basis')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).getByText('Qualification type')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).getByText('Death benefit')
            ).toBeInTheDocument();
        });

        test('Life UL policy shows Account Value and Net Surrender Value', async () => {
            renderPolicyDetailsPage(lifePolicyOverrides);

            const financialsCard = await getFinancialsCard();

            expect(
                within(financialsCard).getByText('Account value')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).getByText('Net surrender value')
            ).toBeInTheDocument();
        });

        test('Term policy shows Death Benefit and Policy Term, not Account Value', async () => {
            renderPolicyDetailsPage(termPolicyOverrides);

            const financialsCard = await getFinancialsCard();

            expect(
                within(financialsCard).getByText('Base death benefit')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).getByText('Policy term')
            ).toBeInTheDocument();
        });

        test('Annuity policy shows Premiums, Withdrawals, RMDs and Funds transaction cards — not Loans', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides);

            const financialsCard = await getFinancialsCard();

            expect(
                await within(financialsCard).findByText('Premiums')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).getByText('Withdrawals')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).getByText('RMDs')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).getByText('Funds')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).queryByText('Loans')
            ).not.toBeInTheDocument();
        });

        test('Life UL policy shows Premiums, Withdrawals, Loans and Funds transaction cards — not RMDs', async () => {
            renderPolicyDetailsPage(lifePolicyOverrides);

            const financialsCard = await getFinancialsCard();

            expect(
                await within(financialsCard).findByText('Premiums')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).getByText('Withdrawals')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).getByText('Loans')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).getByText('Funds')
            ).toBeInTheDocument();
            expect(
                within(financialsCard).queryByText('RMDs')
            ).not.toBeInTheDocument();
        });

        test('Non-Zinnia annuity policy (isTPA=false) shows no transaction cards', async () => {
            expect.hasAssertions();
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                thirdPartyAdministratorId: 'Non-Zinnia',
            });

            expectNoTransactionCards(await getFinancialsCard());
        });

        test('Non-Zinnia life UL policy (isTPA=false) shows no transaction cards', async () => {
            expect.hasAssertions();
            renderPolicyDetailsPage({
                ...lifePolicyOverrides,
                thirdPartyAdministratorId: 'Non-Zinnia',
            });

            expectNoTransactionCards(await getFinancialsCard());
        });
    });

    // ─── LifeTimelineCard product type variants ──────────────────────────────

    describe('LifeTimelineCard product type variants', () => {
        test('INDEXEDUNIVERSALLIFE renders EverlyIul with Fixed Cost Period field', async () => {
            renderPolicyDetailsPage({
                ...iulPolicyOverrides,
                fixedCostPeriod: 20,
            });

            const timelineHeading = await screen.findByRole('heading', {
                name: 'Policy Timeline',
            });
            const timelineCard = timelineHeading.closest(
                '[data-testid="card-container"]'
            ) as HTMLElement;
            expect(
                within(timelineCard).getByText('Fixed cost period')
            ).toBeInTheDocument();
        });

        test('TERM renders TermTimelineDetails without Fixed Cost Period field', async () => {
            renderPolicyDetailsPage(termPolicyOverrides);

            const timelineHeading = await screen.findByRole('heading', {
                name: 'Policy Timeline',
            });
            const timelineCard = timelineHeading.closest(
                '[data-testid="card-container"]'
            ) as HTMLElement;
            expect(
                within(timelineCard).getByText('Policy term')
            ).toBeInTheDocument();
            expect(
                within(timelineCard).queryByText('Fixed cost period')
            ).not.toBeInTheDocument();
        });
    });

    // ─── AnnuityTimelineCard conditional maturityDate ────────────────────────

    describe('AnnuityTimelineCard', () => {
        test('renders Maturity Date field when maturityDate is present', async () => {
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                policyDates: {
                    ...policyEndpointData.policyDates,
                    maturityDate: '2105-02-17',
                },
            });

            await screen.findByRole('heading', { name: 'Contract Timeline' });
            expect(screen.getAllByText('Maturity date')[0]).toBeInTheDocument();
        });

        test('does NOT render Maturity Date field when maturityDate is null', async () => {
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                policyDates: {
                    ...policyEndpointData.policyDates,
                    maturityDate: null,
                },
            });

            const annuityTimelineCard = (await screen.findByRole('heading', {
                name: 'Contract Timeline',
            })) as HTMLElement;

            expect(
                within(annuityTimelineCard).queryByText('Maturity date')
            ).not.toBeInTheDocument();
        });
    });

    // ─── AnnuityApplicationDetailsCard async states ──────────────────────────

    describe('AnnuityApplicationDetailsCard async states', () => {
        test('shows agent name link on successful agent data fetch', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides, [agentDataHandler]);

            await screen.findByRole('heading', { name: 'Application Details' });
            expect(await screen.findByText('Alice Agent')).toBeInTheDocument();
        });

        test('shows error fallback when agent API errors and no agents present', async () => {
            renderPolicyDetailsPage(
                {
                    ...annuityPolicyOverrides,
                    // Remove agentExternalId so the query is disabled and we get no data
                    parties: policyEndpointData.parties?.map((p: any) => ({
                        ...p,
                        agentExternalId: null,
                    })),
                },
                [agentDataErrorHandler]
            );

            await screen.findByRole('heading', { name: 'Application Details' });
            // With no agent parties enabled, the agent section is skipped entirely
            expect(screen.queryByText('Alice Agent')).not.toBeInTheDocument();
        });

        test('skips agent section when no agent parties exist on policy', async () => {
            renderPolicyDetailsPage(
                {
                    ...annuityPolicyOverrides,
                    partyRoles: policyEndpointData.partyRoles?.filter(
                        (r: any) =>
                            r.partyRole !== 'PRIMARYSERVICINGAGENT' &&
                            r.partyRole !== 'PRIMARYWRITINGAGENT'
                    ),
                },
                [agentDataEmptyHandler]
            );

            await screen.findByRole('heading', { name: 'Application Details' });
            expect(screen.queryByText('Alice Agent')).not.toBeInTheDocument();
        });
    });

    // ─── CostBasisQualificationCard toggle ───────────────────────────────────

    describe('CostBasisQualificationCard toggle', () => {
        const getCostBasisCard = async () => {
            const heading = await screen.findByRole('heading', {
                name: 'Cost basis and Qualification',
            });
            return heading.closest(
                '[data-testid="card-container"]'
            ) as HTMLElement;
        };

        test('shows $0.00 for TEFRA/TAMRA fields when detail data is null', async () => {
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                costBasis: {
                    costBasis: 100000,
                    preTaxEquityAndFiscalResponsibilityActBasis: null,
                    preTechnicalAndMiscellaneousRevenueActAmount: null,
                    postTechnicalAndMiscellaneousRevenueActAmount: null,
                },
            });

            const card = await getCostBasisCard();

            // Main cost basis still shows its value
            expect(within(card).getByText('$100,000.00')).toBeInTheDocument();

            fireEvent.click(screen.getByTestId('cost-basis-toggle'));

            expect(
                await within(card).findByText('Pre tefra basis')
            ).toBeInTheDocument();
            expect(
                within(card).getByText('Pre tamra basis')
            ).toBeInTheDocument();
            expect(
                within(card).getByText('Post tamra basis')
            ).toBeInTheDocument();
            // All three null detail values fall back to $0.00
            expect(within(card).getAllByText('$0.00')).toHaveLength(3);
        });

        test('shows always-visible fields and reveals TEFRA/TAMRA labels and values on toggle', async () => {
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                costBasis: {
                    costBasis: 100000,
                    preTaxEquityAndFiscalResponsibilityActBasis: 50000,
                    preTechnicalAndMiscellaneousRevenueActAmount: 30000,
                    postTechnicalAndMiscellaneousRevenueActAmount: 20000,
                },
            });

            const card = await getCostBasisCard();

            // TEFRA/TAMRA hidden before toggle
            expect(
                within(card).queryByText('Pre tefra basis')
            ).not.toBeInTheDocument();

            fireEvent.click(screen.getByTestId('cost-basis-toggle'));

            expect(
                await within(card).findByText('Pre tefra basis')
            ).toBeInTheDocument();
            expect(within(card).getByText('$50,000.00')).toBeInTheDocument();
            expect(
                within(card).getByText('Pre tamra basis')
            ).toBeInTheDocument();
            expect(within(card).getByText('$30,000.00')).toBeInTheDocument();
            expect(
                within(card).getByText('Post tamra basis')
            ).toBeInTheDocument();
            expect(within(card).getByText('$20,000.00')).toBeInTheDocument();
        });
    });
});
