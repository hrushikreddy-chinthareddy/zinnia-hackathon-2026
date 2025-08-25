import { AxiosResponse } from 'axios';

import { USStates } from '@deps/constants/geography/us-states';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { ProductType, ProductTypes } from '@deps/types/product';
import { Prettify } from '@deps/utils/types';

type CreateIllustrationQueryBodyValue = unknown;

interface SingleYearValuesBase {
    year: number;
    accountValue: number;
    cumulativePremiumAmount: number;
    deathBenefitAmount: number;
    faceAmount: number;
    insuranceAgeAtBeginningOfYear: number;
    insuranceAgeAtEndOfYear: number;
    netAccountValue: number;
    netDeathBenefitAmount: number;
    netSurrenderValue: number;
    policyNetOutlayAmount: number;
    policyValue: number;
    premiumOutlayAmount: number;
    surrenderValue: number;
    premiumAmount: number;
}

interface SingleYearValuesIUL extends SingleYearValuesBase {
    accumulatedPremiumAmountAtInterest: number;
    costOfInsurance: number;
    cumulativeWithdrawalAmount: number;
    deathBenefitAmountDueToCorridor: number;
    expenseCharge: number;
    forcedWithdrawalDueToGuidelinesAmount: number;
    guidelineLevelPremiumAmount: number;
    guidelineMaximumPremiumAmount: number;
    guidelineSinglePremiumAmount: number;
    interestRate: number;
    maximumWithdrawalAmount: number;
    minimumPremiumAmount: number;
    netAmountAtRisk: number;
    policyNetOutlayAmountForExpenseSummary: number;
    premiumCharge: number;
    premiumOutlayKey: number;
    riderCharges: number;
    surrenderChargeAmount: number;
    taxDueAmount: number;
    taxableAmount: number;
    totalDistributionAmount: number;
    withdrawalAmount: number;
    sevenPayPremiumAmount: number;
}

export type OutputCoverageValues = {
    policyFee: number;
    modalPolicyFee: number;
    premium: number;
    modalPremium: number;
    modalTablePremium: number;
    flatExtraPremium: number;
    modalFlatExtraPremium: number;
    faceAmount: number;
};

interface BaseScenario {}

interface ScenarioCoveragesBase {
    base: OutputCoverageValues;
}

interface TermLifeCoverages extends ScenarioCoveragesBase {
    acceleratedDeathBenefitForTerminalIllness?: OutputCoverageValues;
    acceleratedDeathBenefitForChronicIllness?: OutputCoverageValues;
    acceleratedDeathBenefitForCriticalIllness?: OutputCoverageValues;
    accidentalDeathBenefit?: OutputCoverageValues;
    charitableGiving?: OutputCoverageValues;
    childrensTerm?: OutputCoverageValues;
    waiverOfPremium?: OutputCoverageValues;
}

interface IndexedUniversalLifeCoverages extends ScenarioCoveragesBase {
    acceleratedDeathBenefitForTerminalIllness?: OutputCoverageValues;
    acceleratedDeathBenefitForChronicIllness?: OutputCoverageValues;
    acceleratedDeathBenefitForCriticalIllness?: OutputCoverageValues;
    accidentalDeathBenefit?: OutputCoverageValues;
    charitableGiving?: OutputCoverageValues;
    childrensTerm?: OutputCoverageValues;
    guaranteedInsurabilityBenefit?: OutputCoverageValues;
    overloanProtection?: OutputCoverageValues;
    ownerWaiverOfDeduction?: OutputCoverageValues;
    waiverOfDeduction?: OutputCoverageValues;
}

type Options = {
    revisedIllustration: boolean;
    solveFor: string;
    fixedCostPeriod: number;
    paymentMode: string;
    discountIndicator: string;
    paymentMethod: string;
    premiumDuration: number;
    premiumDurationOption: string;
    faceAmount: {
        basis: string;
        frequency: string;
        sequence: Array<{
            from: number;
            through: number;
            value: number | string;
        }>;
    };
    deathBenefitOption: {
        basis: string;
        frequency: string;
        sequence: Array<{
            from: number;
            through: number;
            value: number | string;
        }>;
    };
};

type IllustrationInputsBase = {
    calculationType: string;
    source: string;
    illustrationRequestDate: string;
    jurisdiction: USStates;
    planCode: string;
    options: Options;
};

interface TermLifeScenario extends BaseScenario {
    annualTimeSeriesData: SingleYearValuesBase[];
    coverages: TermLifeCoverages;
    initial: {
        totalFaceAmount: number;
        totalPremium: number;
        accountValue: number;
        totalModalPremium: number;
        totalPolicyFee: number;
        totalModalPolicyFee: number;
    };
    lapse: {
        age: number;
        year: number;
    };
}

interface IndexUniversalLifeScenario extends BaseScenario {
    annualTimeSeriesData: SingleYearValuesIUL[];
    coverages: IndexedUniversalLifeCoverages;
    initial: {
        totalFaceAmount: number;
        totalPremium: number;
        accountValue: number;
        totalModalPremium: number;
        totalPolicyFee: number;
        totalModalPolicyFee: number;
    };
    lapse: {
        age: number;
        year: number;
    };
}

type GetNewTermLifeIllustrationResponseBody = {
    inputs: IllustrationInputsBase;
    response: {
        id: string;
        assumed: TermLifeScenario;
    };
};

type GetIndexedUniversalLifeIllustrationResponseBody = {
    inputs: IllustrationInputsBase;
    response: {
        id: string;
        assumed: IndexUniversalLifeScenario;
    };
};

type IllustrationTypeMap = {
    TERM: GetNewTermLifeIllustrationResponseBody;
    INDEX_UNIVERSAL_LIFE: GetIndexedUniversalLifeIllustrationResponseBody;
};

export type Illustration = {
    [K in keyof IllustrationTypeMap]: Prettify<
        {
            productType: K;
        } & IllustrationTypeMap[K]
    >;
}[keyof IllustrationTypeMap];

type GetIllustrationResponseBodyUnion =
    | GetNewTermLifeIllustrationResponseBody
    | GetIndexedUniversalLifeIllustrationResponseBody;

export function isIULIllustrationResponseBody(
    data: GetIllustrationResponseBodyUnion
): data is GetIndexedUniversalLifeIllustrationResponseBody {
    return data.inputs.planCode === 'UL0101';
}

export function isTLIllustrationResponseBody(
    data: GetIllustrationResponseBodyUnion
): data is GetNewTermLifeIllustrationResponseBody {
    return data.inputs.planCode === 'TL0101';
}

const BASE_URL = `${baseAppUrl}/api/illustration/v3`;

export const createIllustration = async ({
    bodyData,
    path,
    inputs,
}: {
    bodyData: CreateIllustrationQueryBodyValue;
    path: string;
    inputs: string;
}) => {
    const response = await client.post<any, AxiosResponse<any>>(
        `${baseAppUrl}/${path}`,
        bodyData
    );

    return {
        ...response,
        data: {
            ...response.data,
            inputs,
        },
    };
};

export const getNewTermLifeIllustration = async (illustrationId: string) => {
    return client
        .get<GetNewTermLifeIllustrationResponseBody>(
            `${BASE_URL}/term-life/new-business/${illustrationId}`
        )
        .then((res) => {
            return {
                ...res.data,
                productType: ProductTypes.TERM as const satisfies ProductType,
            };
        });
};

export const getNewIndexedUniversalLifeIllustration = async (
    illustrationId: string
) => {
    return client
        .get<GetIndexedUniversalLifeIllustrationResponseBody>(
            `${BASE_URL}/indexed-universal-life/new-business/${illustrationId}`
        )
        .then((res) => {
            return {
                ...res.data,
                productType:
                    ProductTypes.INDEX_UNIVERSAL_LIFE as const satisfies ProductType,
            };
        });
};

export const getIllustrationAsyncCalculationStatus = async (
    illustrationId: string
) => {
    return client
        .get<any>(
            `${BASE_URL}/illustration-request/${illustrationId}?format=FORMATTED_ILLUSTRATION_PDF`
        )
        .then((res) => {
            return res;
        });
};
