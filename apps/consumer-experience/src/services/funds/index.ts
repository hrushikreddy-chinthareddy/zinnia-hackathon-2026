import {
  FundAccountTypeEnum,
  FundDescriptor,
  ProductRules,
} from '@zinnia/api-types/types/funds';
import { FundSegment } from '@zinnia/api-types/types/sor';

import { PolicyFund, PolicyRequestInputs } from '@/types/policy';
import { logTrace, logWarn } from '@/utils/logging/server-logging';

import { combineFundData, transformFundsTotalValue } from './transformers';
import { ApiResponse } from '..';
import { getPolicyByPlanCodeAndId } from '../policy';
import { transformPolicyForFundDetails } from '../policy/transformers';
import { ServerApi } from '../server-http';

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

interface GetFundDetailsArgs {
  carrierId?: string;
  fundId: string;
}

interface getProductDetailsArgs {
  carrierId?: string;
  planCode: string;
}

interface getFundsArgs {
  planCode: string;
  policyNumber: string;
}

/**
 * Retrieve fund information for a specific fund id
 * @param param0
 * @returns
 */
export const getFundDetails = async ({
  carrierId,
  fundId,
}: GetFundDetailsArgs): Promise<ApiResponse<FundDetails>> => {
  try {
    const response = await ServerApi.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/funds/v1/carriers/${carrierId}/funds/${fundId}`
    );

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    return {
      data: {
        ...data,
        fundId,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        cause: error,
        status: (error as Response)?.status ?? 502,
        name: 'getFundDetails: error',
        message: 'error getting fund details',
      },
    };
  }
};

/**
 * Loops through a list of fundIds and hits the fund details endpoint.
 * Filters out any fund responses that arent fulfilled
 * @param fundIds
 * @param carrierId
 * @returns
 */
const collectAllFundDetails = async (fundIds: string[], carrierId?: string) => {
  // Loop through each fund and get details like interest rate and product type
  const fundDetailsResponses = fundIds.map(async fundId => {
    return getFundDetails({ carrierId, fundId });
  });

  // wait for the fund details promises to resolve
  const fundDetails = (await Promise.allSettled(fundDetailsResponses))
    .filter(promise => promise.status === 'fulfilled')
    .map(promise => promise.value.data);

  return fundDetails;
};

/**
 * Retrieve fund rules for a specific product. This contains the full list of funds, as well as a sweepDate property for holding funds
 * @param param0
 * @returns
 */

export const getProductDetails = async ({
  carrierId,
  planCode,
}: getProductDetailsArgs): Promise<ApiResponse<ProductRules>> => {
  try {
    const response = await ServerApi.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/funds/v1/carriers/${carrierId}/products/${planCode}`
    );

    if (!response.ok) {
      throw response;
    }

    const data = await response.json();

    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        cause: error,
        status: (error as Response)?.status ?? 502,
        name: 'getProductDetails: error',
        message: 'error getting product details',
      },
    };
  }
};

/**
 * Gets funds for a policy and then builds information for each of them by calling product details and fund details endpoints. Returns what it can.
 * @param param0
 * @returns
 */
export const getFunds = async ({
  planCode,
  policyNumber,
}: getFundsArgs): Promise<ApiResponse<Fund[] | PolicyFund[]>> => {
  try {
    // Get the user policy
    const policyData = await getPolicyByPlanCodeAndId({
      planCode,
      policyNumber,
    });
    const { carrierId } = policyData;

    // Get the funds off the policy and build a list of fund obects
    const policyFunds = transformPolicyForFundDetails(policyData);

    if (!policyFunds) {
      logTrace('transformedResults object was returned null', {});

      return {
        data: null,
        error: {
          message: 'Something went wrong',
          status: 500,
          name: 'getFunds Error',
        },
      };
    }

    // We hit the product endpoint to retrieve a list of funds, as well as get information on the sweepDate of the holding funds.
    const { data: productsDetails, error: productDetailsError } =
      await getProductDetails({
        carrierId,
        planCode,
      });

    if (productDetailsError) {
      logTrace('getProductDetails returned an error', productDetailsError);
    }

    // If the product endpoint fails to return good data, we just return the funds that come back from the policy.
    if (!productsDetails?.funds || productDetailsError) {
      return {
        data: policyFunds,
        error: null,
      };
    }

    // Get all fund details based on fundIds. Returns interestRate and productType from the fund detail API
    const fundIds = Object.keys(productsDetails.funds);
    const fundDetails = await collectAllFundDetails(fundIds, carrierId);

    // Take all of the information and pass it to a combiner function.
    // This function also loops through each fund and calls a separate
    // endpoint to get the interestRate and productType values
    const { data: combinedData, error: combineError } = combineFundData({
      fundDetails,
      productsDetails,
      policyFunds,
    });

    // If something fails here, ust return the user policy funds?
    if (combineError || !combinedData) {
      logTrace('combineFundData returned an error', combineError);
      return {
        data: policyFunds,
        error: null,
      };
    }

    return {
      data: combinedData,
      error: null,
    };
  } catch (e) {
    return {
      data: null,
      error: {
        cause: e,
        status: (e as Response)?.status ?? 502,
        name: 'getFundsInfo: error',
        message: 'error getting funds info',
      },
    };
  }
};

export const getFundsTotalValue = async (policyInputs: PolicyRequestInputs) => {
  logTrace('getFundsTotalValue', {
    planCode: policyInputs.planCode,
    policyNumber: policyInputs.policyNumber,
  });

  // if (isMockPolicyOverviewRequestEnabled()) {
  //   const transformedResults =
  //     transformPolicyProductDetails(mockPolicyResponse);

  //   return {
  //     data: transformedResults,
  //     error: null,
  //   };
  // }

  try {
    const funds = await getFunds(policyInputs);
    const fundsTotalValue = transformFundsTotalValue(funds.data);

    return {
      data: {
        fundsTotalValue,
      },
      error: null,
    };
  } catch (error) {
    logWarn('getFundsTotalValue Error', { error });

    return {
      data: null,
      error: {
        message: 'Something went wrong',
        status: 400,
        name: 'getFundsTotalValue Error',
      },
    };
  }
};
