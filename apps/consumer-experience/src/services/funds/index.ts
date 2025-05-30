import {
  FundAccountTypeEnum,
  FundDescriptor,
  ProductRules,
} from '@zinnia/api-types/types/funds';
import { FundSegment } from '@zinnia/api-types/types/sor';
import { z } from 'zod';

import { PolicyFund, PolicyRequestInputs } from '@/types/policy';
import { CommonLogContext, logTrace } from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { combineFundData, transformFundsTotalValue } from './transformers';
import { EnterpriseTokenApi } from '../enterprise-api-token-http';
import { getPolicyByPlanCodeAndId } from '../policy';
import { transformPolicyForFundDetails } from '../policy/transformers';

const FILE_NAME = '/src/services/funds/index.ts';

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

export const fundValidator = z.object({
  fundId: z.string(),
  fundName: z.string().nullable(),
  totalFundValue: z.number(),
  fundAccountType: z.nativeEnum(FundAccountTypeEnum),
  allocationPercentage: z.number().nullable(),
  interestRate: z.number().nullable(),
  isElected: z.boolean().nullable(),
  sweepDate: z.string().nullable(),
});

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
  fundId?: string;
  queryParams?: { fundDetailsAsOfDate?: string; amount?: number };
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
export const getFundDetails = withLogging(
  async (
    {
      carrierId,
      fundId,
      queryParams: { fundDetailsAsOfDate, amount } = {},
    }: GetFundDetailsArgs,
    loggingCtx: CommonLogContext
  ): Promise<FundDetails> => {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/funds/v1/carriers/${carrierId}/funds/${fundId}`
    );

    if (fundDetailsAsOfDate)
      url.searchParams.set('fundDetailsAsOfDate', fundDetailsAsOfDate);
    if (amount) url.searchParams.set('amount', amount.toString());

    const response = await EnterpriseTokenApi.get(url, undefined, loggingCtx);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      const error = new Error(
        `Error fetching fund details: ${errorData.message || response.statusText}`
      );
      // @ts-expect-error TODO: find a better way to pass status
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return {
      ...data,
      fundId,
    };
  },
  {
    file: FILE_NAME,
    functionName: 'getFundDetails',
  }
);

/**
 * Loops through a list of funds and hits the fund details endpoint.
 * For fixed or holding funds, uses the original deposit date of the first fund segment to fetch details.
 * Filters out any fund responses that arent fulfilled
 * @param funds
 * @param carrierId
 * @returns a list of fund details
 */
const collectAllFundDetails = async (
  funds: (PolicyFund | Fund)[],
  carrierId: string | undefined,
  loggingCtx: CommonLogContext
) => {
  const fundDetailsResponses = funds.map(
    async ({ fundId, fundAccountType, fundSegments }) => {
      if (
        fundAccountType === FundAccountTypeEnum.FIXED ||
        fundAccountType === FundAccountTypeEnum.HOLDING
      ) {
        const fundDetailsAsOfDate = fundSegments?.find(
          ({ segmentId }) => segmentId == '1'
        )?.originalDepositDate;

        return getFundDetails(
          {
            carrierId,
            fundId,
            queryParams: {
              fundDetailsAsOfDate,
            },
          },
          loggingCtx
        );
      }
      return getFundDetails({ carrierId, fundId }, loggingCtx);
    }
  );

  const settledPromises = await Promise.allSettled(fundDetailsResponses);

  settledPromises.forEach(promise => {
    if (promise.status === 'rejected') {
      logTrace('collectAllFundDetails: A fund detail promise was rejected', {
        correlationId: loggingCtx.correlationId,
        reason: promise.reason,
      });
    }
  });

  const fundDetails = settledPromises
    .filter(promise => promise.status === 'fulfilled')
    .map(promise => promise.value.data);

  return fundDetails;
};

/**
 * Retrieve fund rules for a specific product. This contains the full list of funds, as well as a sweepDate property for holding funds
 * @param param0
 * @returns
 */
export const getProductDetails = withLogging(
  async (
    { carrierId, planCode }: getProductDetailsArgs,
    loggingCtx: CommonLogContext
  ): Promise<ProductRules> => {
    const response = await EnterpriseTokenApi.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/funds/v1/carriers/${carrierId}/products/${planCode}`,
      undefined,
      loggingCtx
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      const error = new Error(
        `Error fetching product details: ${errorData.message || response.statusText}`
      );
      // @ts-expect-error
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return data;
  },
  {
    file: FILE_NAME,
    functionName: 'getProductDetails',
  }
);

/**
 * Gets funds for a policy and then builds information for each of them by calling product details and fund details endpoints. Returns what it can.
 * @param param0
 * @returns
 */
export const getFunds = withLogging(
  async (
    { planCode, policyNumber }: getFundsArgs,
    loggingCtx: CommonLogContext
  ): Promise<Fund[] | PolicyFund[]> => {
    const { data: policyData } = await getPolicyByPlanCodeAndId(
      {
        planCode,
        policyNumber,
      },
      loggingCtx
    );

    if (!policyData) {
      throw new Error('Policy data is null');
    }

    const { carrierId } = policyData;

    const policyFunds = transformPolicyForFundDetails(policyData);

    if (!policyFunds) {
      throw new Error('Transformed policy funds are null');
    }

    const { data: productsDetails, error: productDetailsError } =
      await getProductDetails(
        {
          carrierId,
          planCode,
        },
        loggingCtx
      );

    if (!productsDetails?.funds || productDetailsError) {
      logTrace('getFunds: fallback to policyFunds', {
        correlationId: loggingCtx.correlationId,
        productDetailsError: productDetailsError ? true : false,
        hasFundsInProductDetails: productsDetails?.funds ? true : false,
      });
      return policyFunds;
    }

    const fundIds = Object.keys(productsDetails.funds);
    const productFundMap = new Map<string, PolicyFund | Fund>();

    fundIds.forEach(fundId => {
      productFundMap.set(fundId, {
        ...policyFunds?.find(fund => fund.fundId === fundId),
        ...productsDetails?.funds?.[fundId],
      });
    });

    const fundDetails = await collectAllFundDetails(
      Array.from(productFundMap.values()),
      carrierId,
      loggingCtx
    );

    const { data: combinedData, error: combineError } = combineFundData({
      fundDetails,
      productsDetails,
      policyFunds,
    });

    if (combineError || !combinedData) {
      throw new Error(combineError?.message || 'Failed to combine fund data');
    }

    return combinedData;
  },
  {
    file: FILE_NAME,
    functionName: 'getFunds',
  }
);

interface FundsTotalValue {
  fundsTotalValue: number | null;
}

export const getFundsTotalValue = withLogging(
  async (
    policyInputs: PolicyRequestInputs,
    loggingCtx: CommonLogContext
  ): Promise<FundsTotalValue> => {
    const fundsResponse = await getFunds(policyInputs, loggingCtx);

    if (fundsResponse.error || !fundsResponse.data) {
      throw (
        fundsResponse.error ||
        new Error('Failed to retrieve funds or funds data is null.')
      );
    }

    const fundsTotalValue = transformFundsTotalValue(fundsResponse.data);

    return {
      fundsTotalValue,
    };
  },
  {
    file: FILE_NAME,
    functionName: 'getFundsTotalValue',
  }
);
