import { DisbursementCriteriaEnum, FundAccountTypeEnum, FundUsageInfo } from '@deps/models/funds/fund-information';

export interface CarrierFundsResponse {
    data: string[];
    message?: string;
    status: number;
}

export interface FundInformationByPlanCodeResponse {
    data: FundInformationByPlanCode;
    message?: string;
    status: number;
}

export interface FundInformationByFundIdResponse {
    data: FundInformationByFundId;
    message?: string;
    status: number;
}

export interface InvestmentModel {
    [key: string]: number;
}

export interface Fund {
    isInterimAccount: boolean;
    minimumFundValue?: number;
    sweepDay?: number;
}

export interface Funds {
    [key: string]: FundUsageInfo;
}

interface InvestmentModels {
    [key: string]: InvestmentModel;
}

interface DisbursementPrioirtyInfo {
    fundLevelDisbursementMethod: string;
    priority: number;
}

interface DisbursementPriority {
    [key: string]: DisbursementPrioirtyInfo;
}

interface FixedFund {
    bonusPeriodFrequency?: number;
    guaranteedMinimumInterestRate?: number;
    interestRate?: number;
}

interface IndexedFund {
    capRate?: number;
    creditingStrategy?: string;
    dailyPriceIdentifier?: number;
    guaranteedMinimumCapRate?: number;
    guaranteedMinimumInterestRate?: number;
    index?: string;
    interestRate?: number;
    maximiumIllustrativeInterestRate?: number;
    participationRate?: number;
}

export interface FundInformationByFundId {
    fixedFund?: FixedFund;
    fundAccountName?: string;
    fundAccountType?: FundAccountTypeEnum;
    // fundId doesnt come back from the request but adding it to avoid needing a map later
    fundId?: string;
    glCode?: string;
    indexedFund?: IndexedFund;
    minimumTransferAmount?: number;
}

export interface FundInformationByPlanCode {
    basisPoints?: string;
    disbursementCriteria?: DisbursementCriteriaEnum;
    disbursementMethod?: string;
    disbursementPriority?: DisbursementPriority;
    funds?: Funds;
    planCode?: string;
    investmentModels?: InvestmentModels;
}
