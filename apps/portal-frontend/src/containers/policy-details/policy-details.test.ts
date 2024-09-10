import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { Policy, PolicyCoverage, RiskClass } from '@deps/models/policy/sor-policy';

import { buildInsuredData, buildTransactionCards, getInsuredParty, mapPolicyDetails } from './policy-details.helper';

const tSpy = jest.fn(str => str);

describe('policy details helpers', () => {
    describe('buildTransactionCards', () => {
        it('should build the transaction cards for the policy', () => {
            const policyDetailsData = {
                fundValue: 2500,
                lastDeposit: 500,
                loansTaken: 2,
                loansTotalAmount: 10000,
                premiums: 1000,
                premiumsYtd: 500,
                withdrawalsTaken: 3,
                withdrawalTotalAmount: 2000,
            };
            const metaData = { currency: 'USD', planCode: 'SBFIXUL1', policyNumber: '12345' };
            const result = buildTransactionCards(policyDetailsData, metaData, tSpy);

            expect(result).toEqual([
                {
                    cardTitle: 'policy.detailCards.policyDetails.premiums',
                    fieldLabel: 'policy.detailCards.policyDetails.allTimePremium',
                    href: '/policies/SBFIXUL1/12345/transactions/premiums',
                    summary: 'policy.detailCards.policyDetails.ytd $500.00',
                    value: '$1,000.00',
                },
                {
                    cardTitle: 'policy.detailCards.policyDetails.withdrawals',
                    fieldLabel: 'policy.detailCards.policyDetails.withdrawalsTaken',
                    href: '/policies/SBFIXUL1/12345/transactions/withdrawals',
                    summary: 'policy.detailCards.policyDetails.total $2,000.00',
                    value: 3,
                },
                {
                    cardTitle: 'policy.detailCards.policyDetails.loans',
                    fieldLabel: 'policy.detailCards.policyDetails.loansTaken',
                    href: '/policies/SBFIXUL1/12345/transactions/loans',
                    summary: 'policy.detailCards.policyDetails.total $10,000.00',
                    value: 2,
                },
                {
                    cardTitle: 'policy.detailCards.policyDetails.funds',
                    fieldLabel: 'policy.detailCards.policyDetails.totalFundValue',
                    href: '/policies/SBFIXUL1/12345/policy/funds',
                    summary: 'policy.detailCards.policyDetails.lastDeposit $500.00',
                    value: '$2,500.00',
                },
            ]);
        });
    });

    // Write similar tests for other functions...

    describe('mapPolicyDetails', () => {
        it('should map the policy details to the corresponding props', () => {
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
            };
            const result = mapPolicyDetails(policy as Policy, tSpy);

            expect(result).toEqual({
                salesChannel: {
                    salesChannel: 'policy.distributionType.thirdPartyDirectToConsumer',
                    issueState: 'New York',
                },
                insured: {
                    ageAtIssue: 'policy.detailCards.insured.nYearsOld',
                    currentAge: 'policy.detailCards.insured.nYearsOld',
                    fullName: {
                        href: '/policies/SBFIXUL1/12345/people/Party_PI_1',
                        text: 'John Doe',
                    },
                    riskClass: 'people.card.underwritingInfo.riskClassOptions.preferredNonTobacco',
                },
                meta: { currency: 'USD', planCode: 'SBFIXUL1', policyNumber: '12345' },
                policyDetails: {
                    accountValue: 1000,
                    costBasis: undefined,
                    faceValue: 249999,
                    loansTaken: 2,
                    loansTotalAmount: 10000,
                    netSurrenderValue: undefined,
                    premiums: 500,
                    premiumsYtd: 250,
                    withdrawalsTaken: 3,
                    withdrawalTotalAmount: 2000,
                },
                policyTimeline: {
                    issueDate: '1/1/2023',
                    maturityDate: '1/1/2033',
                    policyAge: 'temporal.nYears',
                    policyLength: 'temporal.nYears',
                    policyYearsLeft: 'temporal.timeLeft',
                },
                productDetails: {
                    carrierId: 'C1',
                    glProductCode: 'GLP1',
                    planCode: 'SBFIXUL1',
                    productMarketingName: 'Policy A',
                    productName: 'Plan A',
                    productType: 'Type A',
                },
            });
        });
    });

    describe('getInsuredParty', () => {
        let mockPolicyData: Policy;

        beforeEach(() => {
            mockPolicyData = JSON.parse(JSON.stringify(mockPolicy));
        });

        it('returns an empty object if there is not a party with a role of `Insured`', () => {
            mockPolicyData.partyRoles?.pop();

            const results = getInsuredParty(mockPolicyData);

            expect(results).toEqual({});
        });

        it('returns an empty object if there are not any coverageParticipants', () => {
            (mockPolicyData.coverage as PolicyCoverage).coverageLayers = [];

            const results = getInsuredParty(mockPolicyData);

            expect(results).toEqual({});
        });

        it('returns an empty object if there is not a relevant party', () => {
            mockPolicyData.parties = [];

            const results = getInsuredParty(mockPolicyData);

            expect(results).toEqual({});
        });

        it('returns the expected CoveredParty object', () => {
            const results = getInsuredParty(mockPolicyData);

            expect(results).toEqual({
                ageAtIssue: 18,
                currentAge: 29,
                fullName: 'John Doe',
                partyId: 'Party_PI_1',
                riskClass: RiskClass.PREFERREDNONTOBACCO,
            });
        });
    });

    describe('buildInsuredData', () => {
        let mockPolicyData: Policy;

        beforeEach(() => {
            mockPolicyData = JSON.parse(JSON.stringify(mockPolicy));
        });

        it('returns the expected InsuredCardData object', () => {
            const results = buildInsuredData(mockPolicyData, tSpy);

            expect(results).toEqual({
                ageAtIssue: 'policy.detailCards.insured.nYearsOld',
                currentAge: 'policy.detailCards.insured.nYearsOld',
                fullName: {
                    href: `/policies/${mockPolicyData.product?.planCode}/${mockPolicyData.policyNumber}/people/Party_PI_1`,
                    text: 'John Doe',
                },
                riskClass: 'people.card.underwritingInfo.riskClassOptions.preferredNonTobacco',
            });
        });
    });
});
