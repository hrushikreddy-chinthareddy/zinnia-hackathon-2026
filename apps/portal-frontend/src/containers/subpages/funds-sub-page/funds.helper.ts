import dayjs from 'dayjs';

import { isEndDated } from '@deps/helpers/date.helper';
import { numberFormatify, percentFormatify } from '@deps/helpers/numbers.helper';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { FundUsageInfo } from '@deps/models/funds/fund-information';
import { Fund, FundAccountType, FundAllocation, FundSegment, MatchSegment, Policy, Product, ProductType } from '@deps/models/policy/sor-policy';
import { getFundInformationByFundId, getFundInformationByPlanCode } from '@deps/queries/api/fund-information';
import { getCurrentInterestRate } from '@deps/queries/api/product-rate';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { FundInformationByFundId, FundInformationByFundIdResponse, FundInformationByPlanCode, Funds } from '@deps/types/fund-information';
import { logError } from '@deps/utils/server-logging';

import { FundDetailsViewModel, FundsFirstGlanceViewModel, FundViewModel, MatchViewModel, SegmentViewModel } from './types';

export const isUniversalLife = (productType: ProductType | undefined): boolean => {
  return productType === ProductType.UNIVERSALLIFE;
};

// #region First Glance

export const getFirstGlanceViewModel = (policy: Policy): FundsFirstGlanceViewModel => {
  const funds = policy?.allocation?.funds;
  const totalFundValue = funds && funds.reduce((acc, { totalFundValue = 0 }) => (acc += totalFundValue), 0);
  const loanBalance = policy?.loanValues?.totalLoanBalance;
  const accountValue = policy?.accountValues?.endingAccountValue;

  return {
      accountValue,
      totalFundValue,
      loanBalance,
  };
}

// #endregion

// #region Elected Funds

const getElectedFundsViewModel = async (
  allocationFundsMap?: Record<string, Fund>,
  fundAllocationsInvestmentsMap?: Record<string, FundAllocation>,
  fundsInfoMap?: Record<string, FundInformationByFundId>,
  policy?: Policy,
  productFunds?: Funds,
): Promise<FundViewModel[]> => {
  const electedFunds: FundViewModel[] = [];

  Object.keys(fundAllocationsInvestmentsMap || {}).filter(async fundId => {
    const allocationFund = allocationFundsMap?.[fundId as string];
    const fundInfo = fundsInfoMap?.[fundId as string];
    const productFund = productFunds?.[fundId as string];
    const fundAllocationInvestment = fundAllocationsInvestmentsMap?.[fundId as string];

    const electedFund = await getFundViewModel(allocationFund, fundInfo, productFund, fundAllocationInvestment, policy);

    electedFunds.push(electedFund);
  });

  return electedFunds;
}

// #endregion

// #region Not Elected Funds

const getNotElectedFund = async (
  fundId: string,
  allocationFundsMap?: Record<string, Fund>,
  fundsInfoMap?: Record<string, FundInformationByFundId>,
  policy?: Policy,
  productFunds?: Funds,
): Promise<FundViewModel | undefined> => {
  const fundInfo = fundsInfoMap?.[fundId as string];

  if (fundInfo?.fundAccountType === FundAccountType.HOLDING) {
    return undefined;
  }
  const allocationFund = allocationFundsMap?.[fundId as string];
  const productFund = productFunds?.[fundId as string];

  return await getFundViewModel(allocationFund, fundInfo, productFund, undefined, policy);
}

const getNotElectedFundsViewModel = async (
  allocationFundsMap?: Record<string, Fund>,
  fundAllocationsInvestmentsMap?: Record<string, FundAllocation>,
  fundsInfoMap?: Record<string, FundInformationByFundId>,
  productFunds?: Funds,
): Promise<FundViewModel[]> => {
  const notElectedFundIds = Object.keys(productFunds || {}).filter(fundId => !fundAllocationsInvestmentsMap?.[fundId]);
  const notElectedFunds: FundViewModel[] = [];

  notElectedFundIds?.forEach(async notElectedFundId => {
    const notElectedFund = await getNotElectedFund(notElectedFundId as string, allocationFundsMap, fundsInfoMap);

    if (!notElectedFund) {
      return;
    }

    notElectedFunds.push(notElectedFund);
  });

  return notElectedFunds;
}

// #endregion

// #region Segments
export const getSegmentsViewModel = async (
  segments?: FundSegment[],
  fundsInfoMap?: Record<string, FundInformationByFundId>,
): Promise<SegmentViewModel[]> => {
  const viewModel: SegmentViewModel[] = [];

  segments?.forEach(async (segment) => {
    const fundInfo = fundsInfoMap?.[segment?.fundId as string];

    viewModel.push({
      capRate: fundInfo?.indexedFund?.capRate
        ? percentFormatify(fundInfo?.indexedFund?.capRate, { isInteger: true })
        : DEFAULT_ERROR_STRING,
      depositAmount: numberFormatify(segment.depositAmount),
      endDate: segment.endDate,
      id: segment.segmentId,
      participationRate: fundInfo?.indexedFund?.participationRate
        ? percentFormatify(fundInfo?.indexedFund?.participationRate, { isInteger: true })
        : DEFAULT_ERROR_STRING,
      startDate: segment.startDate,
    });
  });

  return viewModel;
}

// #endregion

// #region Helpers

const getRate = async (policy?: Policy) => {
  if (!policy || !policy.policyDates) {
    return DEFAULT_ERROR_STRING;
  }

  return await getCurrentInterestRate(policy, policy.policyDates.issueDate);
};

const getFundInterestRate = async (fundInfo?: FundInformationByFundId, policy?: Policy): Promise<string> => {
  if (fundInfo?.fundAccountType === FundAccountType.INDEXED) {
    return DEFAULT_ERROR_STRING;
  }

  const fund = fundInfo?.fixedFund || fundInfo?.indexedFund;
  
  if (!fund) {
    const rate = await getRate(policy);

    return percentFormatify(rate, { isInteger: true });
  }

  return percentFormatify(fund.interestRate, { isInteger: true });
}

const getFundType = (fundType?: FundAccountType): string => {
  if (!fundType) {
    return DEFAULT_ERROR_STRING;
  }

  return fundType === FundAccountType.INDEXED
    ? 'Index'
    : fundType;
}

const getSweepDate = (sweepDay?: number | null): string => {
  if (!sweepDay) {
    logError('getSweepDate::missing sweepDay', { sweepDay });

    return DEFAULT_ERROR_STRING;
  }

  const today = dayjs();
  const sweepDate = today.date() >= sweepDay ? today.add(1, 'month').date(sweepDay) : today.date(sweepDay);

  return sweepDate.format('MM/DD/YYYY');
}

// #endregion

// #region Holding Fund

const getHoldingFundsViewModel = async (
  allocationFundsMap?: Record<string, Fund>,
  fundsInfoMap?: Record<string, FundInformationByFundId>,
  productFunds?: Funds,
): Promise<FundViewModel[]> => {
  const fundIds = Object.keys(productFunds || {});  

  if (!fundIds?.length) {
    return [];
  }

  const holdingFunds: FundViewModel[] = [];
  // Used for logging purposes
  let lastFundId = '';

  try {
    fundIds.forEach(async fundId => {
      lastFundId = fundId;

      const fundInfo = fundsInfoMap?.[fundId as string];

      if (fundInfo?.fundAccountType !== FundAccountType.HOLDING as string) {
        return;
      }
  
      const productFund = productFunds?.[fundId as string];
      const allocationFund = allocationFundsMap?.[fundId as string];
      const holdingFund = await getFundViewModel(allocationFund, fundInfo, productFund);

      holdingFunds.push(holdingFund);
    });
  } catch(error) {
      logError('buildHoldingFunds::missing carrierId or fundId', { error, fundId: lastFundId });

      return holdingFunds;
  }

  return holdingFunds;
}

// #endregion

// #region Match

export const getMatchViewModel = (matchSegment?: MatchSegment, product?: Product): MatchViewModel => {  
  return {
    marketingName: product?.marketingName,
    matchAccountValue: numberFormatify(matchSegment?.matchAccountValue),
    matchVestingDate: convertKebabedDateString(matchSegment?.matchVestingDate),
    maximumLifeTimeVestingAmount: numberFormatify(matchSegment?.maximumAnnualVestingAmount),
    product,
    vestingPeriod: matchSegment?.vestingPeriod,
    yearToDateMatchValue: numberFormatify(matchSegment?.yearToDateMatchValue),
  };
}

// #endregion

// #region Funds Info

const getProductFundsInfo = async (carrierId?: string, productFunds?: FundInformationByPlanCode): Promise<FundInformationByFundId[]> => {
  const fundIds = Object.keys(productFunds || {});

  if (!carrierId || !fundIds.length) {
    return [];
  }

  try {
    const fundsInfoResponses = await getFundsInfo(carrierId, fundIds);

    return fundsInfoResponses.map(response => response?.data);

  } catch(error) {
    logError('getProductFundsInfo::error getting fund info', { carrierId, error, fundIds });

    return [];
  }
}

const getFundsInfo = async (carrierId?: string, fundIds?: string[]): Promise<FundInformationByFundIdResponse[]> => {
  if (!fundIds?.length) {
    return [];
  }

  try {
    return await Promise.all(
      fundIds.map(async (fundId) => {
        const response = await getFundInformationByFundId(carrierId, fundId);

        // TODO MG: should we just create a map instead of adding the fundId here
        return { data: { ...response?.data, fundId }, message: response?.message, status: response?.status };
      })
    );
  } catch(error) {
    logError('getFundsInfo::error getting fund info', { carrierId, error, fundIds });

    return [{
      data: {},
      message: 'Error getting fund info',
      status: StatusCode.InternalServerError
    }];
  }
}

// #endregion

const getFundViewModel = async (
  allocationFund?: Fund,
  fundInfo?: FundInformationByFundId,
  fundUsageInfo?: FundUsageInfo,
  fundAllocationInvestment?: FundAllocation,
  policy?: Policy,
): Promise<FundViewModel> => {
  return {
    allocation: percentFormatify(fundAllocationInvestment?.allocationPercentage, { isInteger: true }),
    fundId: fundInfo?.fundId || allocationFund?.fundId,
    fundName: fundInfo?.fundAccountName || allocationFund?.fundName || DEFAULT_ERROR_STRING,
    fundValue: numberFormatify(allocationFund?.totalFundValue || allocationFund?.totalFundValue),
    interestRate: await getFundInterestRate(fundInfo, policy),
    nextSweepDate: getSweepDate(fundUsageInfo?.sweepDay),
    type: getFundType(fundInfo?.fundAccountType || allocationFund?.fundAccountType),
  };
}

const getProductFundsInfoMap = async (policy: Policy, productFunds?: Funds): Promise<Record<string, FundInformationByFundId>> => {
  const productFundsInfo = await getProductFundsInfo(policy?.carrierId, productFunds);
  
  return productFundsInfo.reduce((map, item) => {
    map[item.fundId as string] = item;

    return map;
  }, {} as Record<string, FundInformationByFundId>);
}

export const getFundDetailsViewModel = async (policy: Policy): Promise<FundDetailsViewModel> => {
  const allocationFundsMap = policy?.allocation?.funds?.reduce((map, item) => {
    map[item.fundId as string] = item;

    return map;
}, {} as Record<string, Fund>);

  const fundAllocationsInvestmentsMap = policy?.allocation?.fundAllocationsInvestments?.reduce((map, item) => {
    if (!isEndDated(item?.endDate)) {
      map[item.fundId as string] = item;
    }
      
    return map;
  }, {} as Record<string, FundAllocation>);

  const { data: productFunds } = await getFundInformationByPlanCode(policy?.carrierId, policy?.product?.planCode);
  const productFundsInfoMap = await getProductFundsInfoMap(policy, productFunds?.funds);

  const [electedFunds, holdingFunds, notElectedFunds ] = await Promise.all([
      getElectedFundsViewModel(allocationFundsMap, fundAllocationsInvestmentsMap, productFundsInfoMap, productFunds?.funds),
      getHoldingFundsViewModel(allocationFundsMap, productFundsInfoMap, productFunds?.funds),
      getNotElectedFundsViewModel(allocationFundsMap, fundAllocationsInvestmentsMap, productFundsInfoMap, productFunds?.funds)
    ]);
  
  return { electedFunds, holdingFunds, notElectedFunds }
}
