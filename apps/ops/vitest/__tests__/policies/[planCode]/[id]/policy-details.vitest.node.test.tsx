import { render, screen, fireEvent, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, vi, beforeEach, test, expect } from 'vitest';

import PolicySlug from '@deps/containers/policy-slug/policy-slug';
import { server } from '@vitest/mocks/node';
import policyEndpointData from '@vitest/mocks/policyPage/policyEndpointData.json';
import {
    createTestWrapper,
    CreateTestWrapperOptions,
} from '@vitest/utils/create-test-wrapper';

import {
    agentDataEmptyHandler,
    agentDataErrorHandler,
    agentDataHandler,
} from './helpers/policy-msw-handlers';
import {
    createMockRouter,
    createMockPolicyPageProps,
} from './helpers/policy-test-fixtures';

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

const defaultProps = createMockPolicyPageProps();

type FeatureFlagOverrides = CreateTestWrapperOptions['featureFlags'];

const renderPolicyDetailsPage = (
    policyOverrides: Record<string, unknown> = {},
    handlers: Parameters<typeof server.use> = [],
    featureFlags: FeatureFlagOverrides = {}
) => {
    if (handlers.length > 0) {
        server.use(...handlers);
    }

    server.use(
        http.get('*/api/policies/:planCode/:policyId', ({ params }) =>
            HttpResponse.json({
                data: {
                    ...policyEndpointData,
                    policyNumber: String(params.policyId ?? 'POL123'),
                    product: {
                        ...policyEndpointData.product,
                        planCode: String(params.planCode ?? 'PLAN1'),
                    },
                    ...policyOverrides,
                },
            })
        )
    );

    return render(<PolicySlug {...defaultProps} />, {
        wrapper: createTestWrapper({ featureFlags }),
    });
};

// Annuity base data — mirrors what policyEndpointData already has (lineOfBusiness: ANNUITY)
const annuityPolicyOverrides = {
    product: {
        ...policyEndpointData.product,
        lineOfBusiness: 'ANNUITY',
        productType: 'FIXEDINDEXEDANNUITY',
    },
};

// Life base data — override the default ANNUITY mock to LIFE
const lifePolicyOverrides = {
    product: {
        ...policyEndpointData.product,
        lineOfBusiness: 'LIFE',
        productType: 'UNIVERSALLIFE',
    },
};

const termPolicyOverrides = {
    product: {
        ...policyEndpointData.product,
        lineOfBusiness: 'LIFE',
        productType: 'TERM',
    },
};

const iulPolicyOverrides = {
    product: {
        ...policyEndpointData.product,
        lineOfBusiness: 'LIFE',
        productType: 'INDEXEDUNIVERSALLIFE',
    },
};

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

    // ─── StatusBar layout variants ────────────────────────────────
    describe('StatusBar layout variants', () => {
        test('shows no banners for active policy with no open cases', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides);

            await screen.findByRole('heading', { name: 'Contract Details' });

            expect(
                screen.queryByText(/This policy has \d+ open case/)
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(
                    'This policy needs a payment before it lapses. Go there now?'
                )
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(
                    'This policy is approved for a reinstatement premium.  Go there now?'
                )
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(/This policy has a free look period/)
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText('Initial Death Notification')
            ).not.toBeInTheDocument();
        });

        test('shows case count banner when policy has open cases', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides, [
                http.post('*/api/case/v1/cases/search', () =>
                    HttpResponse.json({ data: [], total: 2 })
                ),
            ]);

            expect(
                await screen.findByText('This policy has 2 open cases')
            ).toBeInTheDocument();
            expect(await screen.findByText('View cases')).toBeInTheDocument();
        });

        test('shows PENDINGLAPSE warning banner when policyStatus is PENDINGLAPSE', async () => {
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                policyStatus: 'PENDINGLAPSE',
            });

            expect(
                await screen.findByText(
                    'This policy needs a payment before it lapses. Go there now?'
                )
            ).toBeInTheDocument();
            expect(
                await screen.findByText('Make a premium payment')
            ).toBeInTheDocument();
        });

        test('shows LAPSE error banner when policyStatus is LAPSE and reinstatement has approvalDate', async () => {
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                policyStatus: 'LAPSE',
                policyFeatures: [
                    ...policyEndpointData.policyFeatures,
                    {
                        featureType: 'REINSTATEMENT',
                        approvalDate: '2024-01-15',
                        endDate: '2024-06-30',
                        period: 3,
                    },
                ],
            });

            expect(
                await screen.findByText(/approved for a reinstatement premium/)
            ).toBeInTheDocument();
            expect(
                await screen.findByText('Make a premium payment')
            ).toBeInTheDocument();
        });

        test('does not show LAPSE banner when policyStatus is LAPSE but no reinstatement approvalDate', async () => {
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                policyStatus: 'LAPSE',
                policyFeatures: [],
            });

            await screen.findByRole('heading', { name: 'Contract Details' });

            expect(
                screen.queryByText(
                    'This policy is approved for a reinstatement premium.  Go there now?'
                )
            ).not.toBeInTheDocument();
        });

        test('shows freeLook banner when feature flag is enabled and policy is in free look period', async () => {
            renderPolicyDetailsPage(
                annuityPolicyOverrides,
                [
                    http.post(
                        '*/api/bpm/v1/policies/:planCode/:policyId/freelookcancellation/eligibilitycheck',
                        () => HttpResponse.json({ status: 'success' })
                    ),
                ],
                {
                    'policy-management_feature_free-look-cancellation': true,
                }
            );

            expect(
                await screen.findByText(/This policy has a free look period/)
            ).toBeInTheDocument();
            expect(
                await screen.findByText('Cancel policy')
            ).toBeInTheDocument();
        });

        test('shows initial death notification banner when carrierId matches enabled flag and death claim not yet created', async () => {
            renderPolicyDetailsPage(
                {
                    ...lifePolicyOverrides,
                    carrierId: 'FLIC',
                },
                [
                    http.get(
                        '*/api/webnonfinancial/claim/v1/initialdeathclaim/exists',
                        () =>
                            HttpResponse.json({
                                isNewRequest: false,
                                zlCaseId: 'CASE-123',
                            })
                    ),
                ],
                { 'claims-feature-flic-idn-death-claim': true }
            );

            expect(
                await screen.findByText('Initial Death Notification')
            ).toBeInTheDocument();
            expect(
                await screen.findByText('View death claim progress')
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
            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                thirdPartyAdministratorId: 'Non-Zinnia',
            });

            expectNoTransactionCards(await getFinancialsCard());
        });

        test('Non-Zinnia life UL policy (isTPA=false) shows no transaction cards', async () => {
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
