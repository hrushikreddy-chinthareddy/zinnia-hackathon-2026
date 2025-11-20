import { Policy } from '@zinnia/api-types/types/sor';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { getPolicyVisibility } from '@deps/helpers/policy-visibility/policy-visibility-helper';
import { mockPolicy } from '@deps/jest/data/mockPolicy';

import {
    buildTransactionCards,
    getApplicationDetailsData,
    mapPolicyTimelineValues,
} from './policy-details.helpers';

const tSpy = jest.fn((str) => str);

const setupTest = <T>(props: T) => {
    const { coverage, parties, partyRoles, policyFeatures } = mockPolicy;
    const policy = {
        issueState: 'NY',
        policyNumber: '12345',
        currency: 'USD',
        accountValues: {
            endingAccountValue: 1000,
            cumulativePremiumSinceIssue: 500,
            totalYearToDatePremiumAmount: 250,
        },
        coverage, //: { totalCoverageAmount: 200000 },
        loanValues: { totalNumberOfLoan: 2, totalLoanBalance: 10000 },
        withdrawalValues: {
            numberOfWithdrawal: 3,
            totalWithdrawalAmount: 2000,
        },
        policyDates: {
            issueDate: '2023-01-01',
            maturityDate: '2033-01-01',
            policyDeliveryDate: '2033-01-01',
        },
        policyYear: 10,
        policyTerm: 20,
        product: {
            generalLedgerPlanCode: 'GLP1',
            planCode: 'SBFIXUL1',
            marketingName: 'Policy A',
            planName: 'Plan A',
            productType: 'Type A',
            distribution: 'THIRDPARTYDIRECTTOCONSUMER',
        },
        carrierId: 'C1',
        partyRoles,
        parties,
        fixedCostPeriod: 20,
        policyFeatures,
        ...props,
    };
    return new PolicyDetails(policy as Policy);
};
describe('policy details helpers', () => {
    describe('buildTransactionCards', () => {
        it('should build the transaction cards for the policy', async () => {
            const policy = new PolicyDetails(mockPolicy);
            const visibility = await getPolicyVisibility(policy);
            const result = buildTransactionCards(policy, tSpy, visibility);

            expect(result).toEqual([
                {
                    cardTitle: 'premiums',
                    fieldLabel: 'allTimePremium',
                    href: '/policies/SBFIXUL1/AU29035902/policy/premiums',
                    summary: 'ytd $500.00',
                    value: '$60.00',
                },
                {
                    cardTitle: 'withdrawals',
                    fieldLabel: 'withdrawalsTaken',
                    href: '/policies/SBFIXUL1/AU29035902/policy/withdrawals',
                    summary: 'total $345.00',
                    value: 3,
                },
                {
                    cardTitle: 'loans',
                    fieldLabel: 'loansTaken',
                    href: '/policies/SBFIXUL1/AU29035902/policy/loans',
                    summary: 'total $0.00',
                    value: 0,
                },
                {
                    cardTitle: 'funds',
                    fieldLabel: 'totalFundValue',
                    href: '/policies/SBFIXUL1/AU29035902/policy/funds',
                    summary: 'lastDeposit $60.00',
                    value: '$695.17',
                },
            ]);
        });

        it('does not render financial cards when TPA is false (Non-Zinnia)', async () => {
            const policy = setupTest({
                thirdPartyAdministratorId: 'Non-Zinnia',
            });
            const visibility = await getPolicyVisibility(policy);
            const result = buildTransactionCards(policy, tSpy, visibility);

            expect(result).toEqual([]);
        });
    });

    // Write similar tests for other functions...
    describe('policyDetails', () => {
        it('should properly map sales channel', () => {
            const policyDetails = setupTest({});
            const result = getApplicationDetailsData(policyDetails, tSpy);
            expect(result).toEqual({
                applicationSource: '--',
                applicationSourceDetails: '--',
                issueState: 'New York',
                originalPolicyNumber: '--',
                salesChannel:
                    'policy.distributionType.thirdPartyDirectToConsumer',
                multiPolicyDiscount: 'yes',
            });
        });
        describe('CUSTOMFEATURES for MultiPolicyDiscount', () => {
            it('should render No when feature has endDate', () => {
                const mockDetails = setupTest({
                    // @ts-expect-error this property exist in the mock and isn't undefined
                    policyFeatures: [mockPolicy.policyFeatures[0]],
                });
                const result = getApplicationDetailsData(mockDetails, tSpy);
                expect(result).toEqual({
                    applicationSource: '--',
                    applicationSourceDetails: '--',
                    issueState: 'New York',
                    originalPolicyNumber: '--',
                    salesChannel:
                        'policy.distributionType.thirdPartyDirectToConsumer',
                    multiPolicyDiscount: 'no',
                });
            });

            it('should render Yes when multiple features exist and one has NO endDate', () => {
                const mockDetails = setupTest({});
                const result = getApplicationDetailsData(mockDetails, tSpy);
                expect(result).toEqual({
                    applicationSource: '--',
                    applicationSourceDetails: '--',
                    issueState: 'New York',
                    originalPolicyNumber: '--',
                    salesChannel:
                        'policy.distributionType.thirdPartyDirectToConsumer',
                    multiPolicyDiscount: 'yes',
                });
            });

            it('should render Yes no matter the order in the policyFeatures array', () => {
                const mockDetails = setupTest({
                    policyFeatures: [
                        // @ts-expect-error this property exist in the mock and isn't undefined
                        mockPolicy.policyFeatures[1],
                        // @ts-expect-error this property exist in the mock and isn't undefined
                        mockPolicy.policyFeatures[0],
                    ],
                });
                const result = getApplicationDetailsData(mockDetails, tSpy);
                expect(result).toEqual({
                    applicationSource: '--',
                    applicationSourceDetails: '--',
                    issueState: 'New York',
                    originalPolicyNumber: '--',
                    salesChannel:
                        'policy.distributionType.thirdPartyDirectToConsumer',
                    multiPolicyDiscount: 'yes',
                });
            });
        });
        it('should map the policy details to the corresponding props', () => {
            const policyDetails = setupTest({});
            const result = mapPolicyTimelineValues(policyDetails, tSpy);

            expect(result).toEqual({
                fixedCostPeriod: 20,
                fixedCostPeriodLeft: 10,
                issueDate: '1/1/2023',
                maturityDate: '1/1/2033',
                policyAge: '10',
                policyLength: 'temporal.nYears',
                policyYearsLeft: 'temporal.timeLeft',
                deliveryDate: '1/1/2033',
            });
        });
    });
});
