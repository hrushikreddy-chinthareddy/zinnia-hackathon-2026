import {
  FundAccountTypeEnum,
  FundDescriptor,
} from '@zinnia/api-types/types/funds';
import { FundSegment } from '@zinnia/api-types/types/sor';

export interface FundDetails extends FundDescriptor {
  fundId: string;
}

/**
 * The FundSegment type provided in SOR does not match what we get back from the
 * funds API, but the funds API doesn't have a FundSegment type. So just doing this for now
 */
export interface ExtendedFundSegment extends FundSegment {
  interestEarningAmount: number;
  startingPrice: number;
  startingPriceDate: string;
  endingPrice: number;
  endingPriceDate: string;
}

export interface Fund {
  fundId?: string;
  fundName?: string | null;
  totalFundValue?: number;
  fundSegments?: Array<ExtendedFundSegment> | Array<FundSegment>;
  fundAccountType?: FundAccountTypeEnum;
  allocationPercentage?: number | null;
  interestRate?: number | null;
  isElected?: boolean;
  sweepDate?: string | null;
}

export interface GetFundDetailsArgs {
  carrierId?: string;
  fundId?: string;
  queryParams?: { fundDetailsAsOfDate?: string; amount?: number };
}

export interface GetProductDetailsArgs {
  carrierId?: string;
  planCode: string;
}

export interface GetFundsArgs {
  planCode: string;
  policyNumber: string;
}
