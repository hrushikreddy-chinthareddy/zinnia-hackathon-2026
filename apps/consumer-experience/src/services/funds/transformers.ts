import {
  FundAccountTypeEnum,
  ProductRules,
} from '@zinnia/api-types/types/funds';
import { FundAccountType } from '@zinnia/api-types/types/sor';

import { PolicyFund } from '@/types/policy';
import { getNextOccurrenceOfDay } from '@/utils/dates';
import { findPropertyValue } from '@/utils/objects';

import { ApiResponse } from '..';
import { FundDetails, Fund } from './types';

const FundAccountTypesForPolicyDetailsData: (
  | FundAccountType
  | FundAccountTypeEnum
)[] = [FundAccountType.FIXED, FundAccountTypeEnum.HOLDING];

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

  // Merges the product details, the policy funds, and the fund info arrays and combine the data in both.
  // Combines data if the ID exists in both arrays
  const productIds = Object.keys(productsDetails.funds) || [];
  const map = new Map<string, Fund>();

  // Loop over all products to gather info on any fund products associated with the carrier
  productIds.forEach(fundId => {
    map.set(fundId, {
      ...productsDetails?.funds?.[fundId],
      sweepDate: getNextOccurrenceOfDay(
        productsDetails?.funds?.[fundId]?.sweepDay
      ),
    });
  });

  //Loop over the funds and make sure to set total fund value
  policyFunds.forEach(
    item =>
      item &&
      item.fundId &&
      map.set(item.fundId, {
        ...map.get(item.fundId), //get the previous mapped value if it exists and spread the object out
        ...item,
        isElected: !!item?.allocationPercentage,
        fundAccountType: item.fundAccountType as unknown as FundAccountTypeEnum,
      })
  );

  //Loop over allocations and make sure to set percentage
  fundDetails.forEach(item => {
    if (!item) return;
    let interestRate = findPropertyValue<
      FundDetails | undefined | null,
      number
    >(item, 'interestRate');

    const policyFund = map.get(item.fundId);

    if (
      policyFund?.fundAccountType &&
      FundAccountTypesForPolicyDetailsData.includes(policyFund.fundAccountType)
    ) {
      const segment = policyFund?.fundSegments?.find(
        // holding and fixed fund types have one rate for all segments
        // that may not be true in the future
        // in which case this will have to change
        segment => segment.segmentId === '1'
      );
      interestRate = segment?.startingPrice;
    }

    map.set(item.fundId, {
      ...map.get(item.fundId), //get the previous mapped value if it exists and spread the object out
      ...item,
      fundName: item?.fundAccountName,
      interestRate,
    });
  });

  return {
    data: Array.from(map.values()),
    error: null,
  };
};

export const transformFundsTotalValue = (
  funds: Fund[] | PolicyFund[] | null
) => {
  if (!funds) {
    return 0;
  }

  return funds.reduce((total, fund) => {
    if (!fund.totalFundValue) {
      return total;
    }

    return total + fund.totalFundValue;
  }, 0);
};
