import dayjs from 'dayjs';

import { isEndDated } from '@deps/helpers/date.helpers';
import { numberFormatify, percentFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { FundUsageInfo } from '@deps/models/funds/fund-information';
import { Fund, FundAccountType, FundAllocation, FundSegment, MatchSegment, Product } from '@deps/models/policy/sor-policy';
import { getFundInformationByFundId, getFundInformationByPlanCode } from '@deps/queries/api/fund-information';
import { getCurrentInterestRate } from '@deps/queries/api/product-rate';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { FundInformationByFundId, FundInformationByFundIdResponse, FundInformationByPlanCode, Funds } from '@deps/types/fund-information';

import { FundDetailsViewModel, FundViewModel, MatchViewModel, SegmentViewModel } from './types';

const FundAccountTypesForPolicyDetailsData: FundAccountType[] = [FundAccountType.FIXED, FundAccountType.HOLDING];

// #region First Glance

// export const getFirstGlanceViewModel = (policy: PolicyDetails): FundsFirstGlanceViewModel => {
//     const funds = policy?.policy?.allocation?.funds;
//     const totalFundValue = funds && funds.reduce((acc, { totalFundValue = 0 }) => (acc += totalFundValue), 0);
//     const loanBalance = policy?.policy?.loanValues?.totalLoanBalance;
//     const accountValue = policy?.policy?.accountValues?.endingAccountValue;

//     return {
//         accountValue,
//         totalFundValue,
//         loanBalance,
//         policy,
//     };
// };

// #endregion

// #region Elected Funds

interface ElectedFundsViewModelProps {
    allocationFundsMap?: Record<string, Fund>;
    fundAllocationsInvestmentsMap?: Record<string, FundAllocation>;
    fundsInfoMap?: Record<string, FundInformationByFundId>;
    policy?: PolicyDetails;
    productFunds?: Funds;
}

const getElectedFundsViewModel = async ({
    allocationFundsMap,
    fundAllocationsInvestmentsMap,
    fundsInfoMap,
    policy,
    productFunds,
}: ElectedFundsViewModelProps): Promise<FundViewModel[]> => {
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
};

// #endregion

// #region Not Elected Funds

const getNotElectedFund = async (
    fundId: string,
    allocationFundsMap?: Record<string, Fund>,
    fundsInfoMap?: Record<string, FundInformationByFundId>,
    policy?: PolicyDetails,
    productFunds?: Funds
): Promise<FundViewModel | undefined> => {
    const fundInfo = fundsInfoMap?.[fundId as string];

    if (fundInfo?.fundAccountType === FundAccountType.HOLDING) {
        return undefined;
    }
    const allocationFund = allocationFundsMap?.[fundId as string];
    const productFund = productFunds?.[fundId as string];

    return await getFundViewModel(allocationFund, fundInfo, productFund, undefined, policy);
};

interface NotElectedFundsViewModelProps {
    allocationFundsMap?: Record<string, Fund>;
    fundAllocationsInvestmentsMap?: Record<string, FundAllocation>;
    fundsInfoMap?: Record<string, FundInformationByFundId>;
    productFunds?: Funds;
}
const getNotElectedFundsViewModel = async ({
    allocationFundsMap,
    fundAllocationsInvestmentsMap,
    fundsInfoMap,
    productFunds,
}: NotElectedFundsViewModelProps): Promise<FundViewModel[]> => {
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
};

// #endregion

// #region Segments
export const getSegmentsViewModel = async (
    segments?: FundSegment[],
    fundsInfoMap?: Record<string, FundInformationByFundId>
): Promise<SegmentViewModel[]> => {
    const viewModel: SegmentViewModel[] = [];

    segments?.forEach(async segment => {
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
};

// #endregion

// #region Helpers

const getRate = async (policy?: PolicyDetails) => {
    if (!policy || !policy.policy?.policyDates) {
        return DEFAULT_ERROR_STRING;
    }

    return await getCurrentInterestRate(policy, policy.policy.policyDates.issueDate);
};

const getFundInterestRate = async (fundInfo?: FundInformationByFundId, policy?: PolicyDetails): Promise<string> => {
    if (fundInfo?.fundAccountType === FundAccountType.INDEXED) {
        return DEFAULT_ERROR_STRING;
    }

    /* DEPU-4944 - Fixed/Holding funds should use the rate from the policy details
      BPB - policy details only includes rates for elected/allocated fixed funds.
      Unallocated funds will not show a rate on the funds page.
    */
    if (FundAccountTypesForPolicyDetailsData.includes(fundInfo?.fundAccountType as FundAccountType)) {
        const rate = policy?.policy?.allocation?.funds
            ?.find(fund => fund.fundId === fundInfo?.fundId)
            ?.fundSegments?.find(segment => segment.segmentId === '1')?.startingPrice;
        return percentFormatify(rate, { isInteger: true });
    }

    const fund = fundInfo?.fixedFund || fundInfo?.indexedFund;

    if (!fund) {
        const rate = await getRate(policy);

        return percentFormatify(rate, { isInteger: true });
    }

    return percentFormatify(fund.interestRate, { isInteger: true });
};

const getFundType = (fundType?: FundAccountType): string => {
    if (!fundType) {
        return DEFAULT_ERROR_STRING;
    }

    return fundType === FundAccountType.INDEXED ? 'Index' : fundType;
};

const getSweepDate = (sweepDay?: number | null): string => {
    if (!sweepDay) {
        console.error('getSweepDate::missing sweepDay', { sweepDay });

        return DEFAULT_ERROR_STRING;
    }

    const today = dayjs();
    const sweepDate = today.date() >= sweepDay ? today.add(1, 'month').date(sweepDay) : today.date(sweepDay);

    return sweepDate.format('MM/DD/YYYY');
};

// #endregion

// #region Holding Fund

interface HoldingFundsViewModelProps {
    allocationFundsMap?: Record<string, Fund>;
    fundsInfoMap?: Record<string, FundInformationByFundId>;
    productFunds?: Funds;
    policy?: PolicyDetails;
}

const getHoldingFundsViewModel = async ({
    allocationFundsMap,
    fundsInfoMap,
    productFunds,
    policy,
}: HoldingFundsViewModelProps): Promise<FundViewModel[]> => {
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

            if (fundInfo?.fundAccountType !== (FundAccountType.HOLDING as string)) {
                return;
            }

            const productFund = productFunds?.[fundId as string];
            const allocationFund = allocationFundsMap?.[fundId as string];
            const holdingFund = await getFundViewModel(allocationFund, fundInfo, productFund, undefined, policy);

            holdingFunds.push(holdingFund);
        });
    } catch (error) {
        console.error('buildHoldingFunds::missing carrierId or fundId', { error, fundId: lastFundId });

        return holdingFunds;
    }

    return holdingFunds;
};

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
};

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
    } catch (error) {
        console.error('getProductFundsInfo::error getting fund info', { carrierId, error, fundIds });

        return [];
    }
};

const getFundsInfo = async (carrierId?: string, fundIds?: string[]): Promise<FundInformationByFundIdResponse[]> => {
    if (!fundIds?.length) {
        return [];
    }

    try {
        return await Promise.all(
            fundIds.map(async fundId => {
                const response = await getFundInformationByFundId(carrierId, fundId);

                return { data: { ...response?.data, fundId }, message: response?.message, status: response?.status };
            })
        );
    } catch (error) {
        console.error('getFundsInfo::error getting fund info', { carrierId, error, fundIds });

        return [
            {
                data: {},
                message: 'Error getting fund info',
                status: StatusCode.InternalServerError,
            },
        ];
    }
};

// #endregion

const getFundViewModel = async (
    allocationFund?: Fund,
    fundInfo?: FundInformationByFundId,
    fundUsageInfo?: FundUsageInfo,
    fundAllocationInvestment?: FundAllocation,
    policy?: PolicyDetails
): Promise<FundViewModel> => {
    return {
        allocation: percentFormatify(fundAllocationInvestment?.allocationPercentage, { isInteger: true }),
        fundId: fundInfo?.fundId || allocationFund?.fundId,
        fundName: fundInfo?.fundAccountName || allocationFund?.fundName || DEFAULT_ERROR_STRING,
        fundValue: numberFormatify(allocationFund?.totalFundValue || allocationFund?.totalFundValue),
        interestGuaranteedPeriod: allocationFund?.interestGuaranteedPeriod,
        interestRate: await getFundInterestRate(fundInfo, policy),
        nextSweepDate: getSweepDate(fundUsageInfo?.sweepDay),
        type: getFundType(fundInfo?.fundAccountType || allocationFund?.fundAccountType),
    };
};

const getProductFundsInfoMap = async (policy: PolicyDetails, productFunds?: Funds): Promise<Record<string, FundInformationByFundId>> => {
    const productFundsInfo = await getProductFundsInfo(policy?.carrierId, productFunds);

    return productFundsInfo.reduce((map, item) => {
        map[item.fundId as string] = item;

        return map;
    }, {} as Record<string, FundInformationByFundId>);
};

export const getFundDetailsViewModel = async (policy: PolicyDetails): Promise<FundDetailsViewModel> => {
    const allocationFundsMap = policy?.policy?.allocation?.funds?.reduce((map, item) => {
        map[item.fundId as string] = item;

        return map;
    }, {} as Record<string, Fund>);

    const fundAllocationsInvestmentsMap = policy?.policy?.allocation?.fundAllocationsInvestments?.reduce((map, item) => {
        if (!isEndDated(item?.endDate)) {
            map[item.fundId as string] = item;
        }

        return map;
    }, {} as Record<string, FundAllocation>);

    const planCode = policy?.planCode || policy?.product?.planCode;

    const { data: productFunds } = await getFundInformationByPlanCode(policy?.carrierId, planCode);
    const productFundsInfoMap = await getProductFundsInfoMap(policy, productFunds?.funds);

    const [electedFunds, holdingFunds, notElectedFunds] = await Promise.all([
        getElectedFundsViewModel({
            allocationFundsMap,
            fundAllocationsInvestmentsMap,
            fundsInfoMap: productFundsInfoMap,
            productFunds: productFunds?.funds,
            policy,
        }),
        getHoldingFundsViewModel({
            allocationFundsMap,
            fundsInfoMap: productFundsInfoMap,
            productFunds: productFunds?.funds,
            policy,
        }),
        getNotElectedFundsViewModel({
            allocationFundsMap,
            fundAllocationsInvestmentsMap,
            fundsInfoMap: productFundsInfoMap,
            productFunds: productFunds?.funds,
        }),
    ]);

    return { electedFunds, holdingFunds, notElectedFunds };
};
