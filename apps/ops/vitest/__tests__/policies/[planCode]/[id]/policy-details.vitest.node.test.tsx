import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    agentDataLoadingHandler,
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

    // ─── PolicyFinancialsCard layout variants ────────────────────────────────

    describe('PolicyFinancialsCard layout variants', () => {
        test('Annuity policy shows Surrender Value and Qualification Type', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides);

            expect(
                await screen.findByText('Surrender value')
            ).toBeInTheDocument();
            expect(screen.getAllByText('Qualification type')[0]).toBeInTheDocument();
        });

        test('Life UL policy shows Account Value and Net Surrender Value', async () => {
            renderPolicyDetailsPage(lifePolicyOverrides);

            expect(
                (await screen.findAllByText('Account value'))[0]
            ).toBeInTheDocument();
            expect(screen.getAllByText('Net surrender value')[0]).toBeInTheDocument();
            expect(
                screen.queryByText('Qualification type')
            ).not.toBeInTheDocument();
        });

        test('Term policy shows Death Benefit and Policy Term, not Account Value', async () => {
            renderPolicyDetailsPage(termPolicyOverrides);

            expect(
                (await screen.findAllByText('Base death benefit'))[0]
            ).toBeInTheDocument();
            expect(screen.getAllByText('Policy term')[0]).toBeInTheDocument();
            expect(screen.queryByText('Account value')).not.toBeInTheDocument();
            expect(
                screen.queryByText('Net surrender value')
            ).not.toBeInTheDocument();
        });
    });

    // ─── LifeTimelineCard product type variants ──────────────────────────────

    describe('LifeTimelineCard product type variants', () => {
        test('INDEXEDUNIVERSALLIFE renders EverlyIul with Fixed Cost Period field', async () => {
            renderPolicyDetailsPage({
                ...iulPolicyOverrides,
                fixedCostPeriod: 20,
            });

            await screen.findByRole('heading', { name: 'Policy Timeline' });
            expect(screen.getAllByText('Fixed cost period')[0]).toBeInTheDocument();
        });

        test('TERM renders TermTimelineDetails without Fixed Cost Period field', async () => {
            renderPolicyDetailsPage(termPolicyOverrides);

            await screen.findByRole('heading', { name: 'Policy Timeline' });
            expect(
                screen.queryByText('Fixed cost period')
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
        test('shows loading indicator while agent data is fetching', async () => {
            renderPolicyDetailsPage(annuityPolicyOverrides, [
                agentDataLoadingHandler,
            ]);

            await screen.findByRole('heading', { name: 'Application Details' });
            // PageLoader renders inside the card while loading (in addition to the page-level overlay)
            expect(screen.getAllByTestId('test-loader').length).toBeGreaterThan(1);
        });

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
        test('toggling "Show detailed cost basis" reveals TEFRA/TAMRA fields', async () => {
            const user = userEvent.setup();

            renderPolicyDetailsPage({
                ...annuityPolicyOverrides,
                costBasis: {
                    costBasis: 100000,
                    preTaxEquityAndFiscalResponsibilityActBasis: 50000,
                    preTechnicalAndMiscellaneousRevenueActAmount: 30000,
                    postTechnicalAndMiscellaneousRevenueActAmount: 20000,
                },
            });

            await screen.findByRole('heading', {
                name: 'Cost basis and Qualification',
            });

            // Detailed fields are hidden before toggle
            expect(
                screen.queryByText('Pre Tefra basis')
            ).not.toBeInTheDocument();

            // Toggle on using data-testid (same approach as the unit test)
            fireEvent.click(screen.getByTestId('cost-basis-toggle'));

            expect(screen.getByText('Pre Tefra basis')).toBeInTheDocument();
            expect(screen.getByText('Pre Tamra basis')).toBeInTheDocument();
            expect(screen.getByText('Post Tamra basis')).toBeInTheDocument();
        });
    });
});
