import { ProductRules } from '@zinnia/api-types/types/funds';

import { PolicyFund } from '@/types/policy';
import { getNextOccurrenceOfDay } from '@/utils/dates';
import { findPropertyValue } from '@/utils/objects';

import { FundDetails, Fund } from '.';
import { ApiResponse } from '..';

interface CombineFundArgs {
  fundDetails: (FundDetails | null | undefined)[];
  productsDetails: ProductRules | null;
  policyFunds: PolicyFund[] | null;
}

/**
 * Takes the fund details from the policy and product rules endpoint, then combines them with the fund details endpoint to
 * return a more complete fund object that includes info like interestRate, sweepDate, etc
 * @param param0
 * @returns
 */
export const combineFundData = ({
  fundDetails,
  productsDetails,
  policyFunds,
}: CombineFundArgs): ApiResponse<Fund[]> => {
  if (!productsDetails?.funds || !policyFunds || !fundDetails.length) {
    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 500,
        name: 'combineFunds Error',
      },
    };
  }
  const funds = Object.keys(productsDetails.funds).map(fundId => {
    const fundInfo = fundDetails.find(fund => fund?.fundId === fundId);
    const policyFund = policyFunds?.find(fund => fund.fundId === fundId);

    const sweepDay = productsDetails?.funds?.[fundId]?.sweepDay;

    const fund: Fund = {
      fundId: fundId,
      fundName: fundInfo?.fundAccountName,
      totalFundValue: policyFund?.totalFundValue,
      fundSegments: policyFund?.fundSegments,
      fundAccountType: fundInfo?.fundAccountType,
      allocationPercentage: policyFund?.allocationPercentage,
      interestRate: findPropertyValue<FundDetails | undefined | null, number>(
        fundInfo,
        'interestRate'
      ),
      isElected: !!policyFund?.allocationPercentage,
      sweepDate: getNextOccurrenceOfDay(sweepDay),
    };
    return fund;
  });

  return {
    data: funds,
    error: null,
  };
};
