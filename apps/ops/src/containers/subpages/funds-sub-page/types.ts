import { Policy, Product } from '@deps/models/policy/sor-policy';

export interface FundDetailsViewModel {
    electedFunds: FundViewModel[];
    holdingFunds: FundViewModel[];
    notElectedFunds: FundViewModel[];
}

export interface SegmentViewModel {
    // fundFromFundId.indexedFund.capRate
    capRate?: string;

    // Amount swept into segment
    // fund.fundSegments[0].depositAmount
    depositAmount?: string;

    // When the segment is closed
    // fund.fundSegments[0].endDate
    endDate?: string;

    // Unique identifying number
    // fund.fundSegments[0].segmentId
    id?: string;

    // Will requiring quering against the segment START date to get the value for each segment
    // fundFromFundId.indexedFund.participationRate
    participationRate?: string;

    // When the segment is opened
    // fund.fundSegments[0].startDate
    startDate?: string;
}

export interface FundViewModel {
    // Percentage of portfolio invested in each fund
    // policy?.allocation.fundAllocationsInvestments.allocationPercentage
    allocation?: string;

    // Fund Id
    // funds[0].fundId
    fundId?: string;

    // Formal name of fund
    // funds[0].fundName
    fundName?: string;

    // Total of all elected fund values in a policy
    // funds[i].totalFundValue
    fundValue?: string;

    // Interest rate for FIXED funds only
    // funds[0].fixedFund.interestRate
    interestRate?: string;

    // Date sweep transaction occurs
    // productFund?.sweepDay
    nextSweepDate?: string;

    segments?: SegmentViewModel[];

    // Fixed, Index, Variable etc
    // funds[0].fundType
    type?: string;
}

export interface MatchViewModel {
    matchRate?: string;
    marketingName?: string;
    product?: Product;
    policy?: Policy;
    matchAccountValue?: string;
    yearToDateMatchValue?: string;
    vestingPeriod?: number;
    matchVestingDate?: string;
    maximumLifeTimeVestingAmount?: string;
}
