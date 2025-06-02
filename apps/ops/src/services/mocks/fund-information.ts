import { FundAccountType } from '@zinnia/api-types/types/sor';

import { DisbursementMethodEnum, FundLevelDisbursementMethodEnum } from '@deps/models/funds/fund-information';
import { FundInformationByFundId, FundInformationByPlanCode } from '@deps/types/fund-information';

export const mockFundInformationByFundId: FundInformationByFundId = {
    fixedFund: {
        bonusPeriodFrequency: 0,
        guaranteedMinimumInterestRate: 1.0,
        interestRate: 4.0,
    },
    fundAccountName: 'Everly Holding Fund',
    fundAccountType: FundAccountType.FIXED,
    glCode: '000',
    minimumTransferAmount: 10.0,
};

export const mockFundInformationByPlanCode: FundInformationByPlanCode = {
    // Mocked from /funds/v1/carriers/ELIC/products/ELIULV01
    disbursementMethod: DisbursementMethodEnum.FUND_SPECIFIC,
    planCode: 'ELIULV01',
    funds: {
        ELH001: {
            isInterimAccount: true,
            sweepDay: 15,
        },
        ELI001: {
            isInterimAccount: false,
        },
        ELI002: {
            isInterimAccount: false,
        },
        ELF001: {
            isInterimAccount: false,
        },
    },
    disbursementPriority: {
        ELI001: {
            fundLevelDisbursementMethod: FundLevelDisbursementMethodEnum.PRO_RATA,
            priority: 1,
        },
        ELI002: {
            fundLevelDisbursementMethod: FundLevelDisbursementMethodEnum.PRO_RATA,
            priority: 2,
        },
        ELF001: {
            fundLevelDisbursementMethod: FundLevelDisbursementMethodEnum.PRO_RATA,
            priority: 3,
        },
    },
    investmentModels: {
        default: {
            ELI001: 0,
            ELI002: 0,
            ELF001: 100,
        },
    },
};
