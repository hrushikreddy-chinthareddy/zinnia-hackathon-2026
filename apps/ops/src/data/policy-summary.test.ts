import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { mockT as t } from '@deps/setupTests';

import { PolicySummaryColDto, toPolicySummaryColDto } from './policy-summary';

describe('toPolicySummaryColDto', () => {
    it.skip('should return the correct PolicySummaryColDto', () => {
        const expected: PolicySummaryColDto = {
            upcomingMonthlyPremium: '300,10/14/2024,1234,CHECKING,AU29035902',
            maturityDate: '2125-03-27',
            issueDate: '3/28/2023',
            baseDeathBenefit: 249999,
            accountValue: 32.34626,
            surrenderValue: 32.34626,
            upcomingPremium: {
                policy: mockPolicy,
                amount: 300,
                paymentDate: '2024-10-14',
                bankAccount: {
                    accountNumber: '******1234',
                    accountStatus: 'ACTIVEBANKACCOUNT',
                    accountType: 'CHECKING',
                    appliesToPartyId: "Party_PI_2",
                    bankId: "BANK_1",
                    branchName: "CITIZEN BANK",
                    endDate: "null",
                    internationalBankAccountNumber: undefined,
                    nameOnAccount: "NAELA SAFI Number 2",
                    routingNumber: "000111222333",
                    startDate: "2023-11-17",
                },
            },
            fixedCostPeriod: "temporal.nYears",
            fixedCostPeriodLeft: "temporal.timeLeft",
        };

        const result = toPolicySummaryColDto(mockPolicy, t);

        expect(result).toEqual(expected);
    });
});
