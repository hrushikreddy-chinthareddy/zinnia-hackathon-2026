import { Policy } from '@zinnia/api-types/types/sor';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { mockPolicy } from '@deps/jest/data/mockPolicy';

import { buildTransactionCards, getApplicationDetailsData, mapPolicyTimelineValues } from './policy-details.helpers';

const tSpy = jest.fn(str => str);

let policyDetails: PolicyDetails;
describe('policy details helpers', () => {
    describe('buildTransactionCards', () => {
        it('should build the transaction cards for the policy', () => {
            const result = buildTransactionCards(new PolicyDetails(mockPolicy), tSpy);

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
    });

    // Write similar tests for other functions...
    describe('policyDetails', () => {
        beforeAll(() => {
            const { coverage, parties, partyRoles } = mockPolicy;
            const policy = {
                issueState: 'NY',
                policyNumber: '12345',
                currency: 'USD',
                accountValues: { endingAccountValue: 1000, cumulativePremiumSinceIssue: 500, totalYearToDatePremiumAmount: 250 },
                coverage, //: { totalCoverageAmount: 200000 },
                loanValues: { totalNumberOfLoan: 2, totalLoanBalance: 10000 },
                withdrawalValues: { numberOfWithdrawal: 3, totalWithdrawalAmount: 2000 },
                policyDates: {
                    issueDate: '2023-01-01',
                    maturityDate: '2033-01-01',
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
            };
            policyDetails = new PolicyDetails(policy as Policy);
        });
        it('should properly map sales channel', () => {
            const result = getApplicationDetailsData(policyDetails, tSpy);
            expect(result).toEqual({
                applicationSource: '--',
                applicationSourceDetails: '--',
                issueState: 'New York',
                originalPolicyNumber: '--',
                salesChannel: 'policy.distributionType.thirdPartyDirectToConsumer',
            });
        });
        it('should map the policy details to the corresponding props', () => {
            const result = mapPolicyTimelineValues(policyDetails, tSpy);

            expect(result).toEqual({
                fixedCostPeriod: 20,
                fixedCostPeriodLeft: 10,
                issueDate: '1/1/2023',
                maturityDate: '1/1/2033',
                policyAge: 'temporal.nYears',
                policyLength: 'temporal.nYears',
                policyYearsLeft: 'temporal.timeLeft',
            });
        });
    });
});
