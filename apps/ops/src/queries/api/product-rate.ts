import { datadogRum } from '@datadog/browser-rum';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { ConfiguredSettingId } from '@deps/types/product-config-settings';
import {
    BenefitId,
    CoverageToBenefitId,
    RiderBenefit,
    riderChronicIllnessSettings,
    riderCriticalIllnessSettings,
    riderTerminalIllnessSettings,
    riderOverloanProtectionSettings,
    CoverageId,
} from '@deps/types/product-rate';
import { Rider, RiderType } from '@zinnia/api-types/types/sor';

type ProductRateResponse = {
    carrier: string;
    product: string;
    benefit: string;
    configuredItem: string;
    units: string;
    effectiveDate: {
        [key: string]: {
            gender: string;
            riskClass: string;
            smokeClass: string;
            coverageBandLowerBound: number;
            ages: {
                [key: string]: number[];
            };
        }[];
    };
};

const appUrlCarriers = `${baseAppUrl}/api/product-rate/v1/carriers`;

const buildClientSideProductRatePathUrl = (
    carrierCode: string,
    planCode: string,
    benefitCode?: string,
    resource?: ConfiguredSettingId,
    querySearchParams?: string
): string => {
    return `${appUrlCarriers}/${carrierCode}/products/${planCode}/benefits/${benefitCode}/configured-settings/${resource}${
        querySearchParams ? `?${querySearchParams}` : ''
    }`;
};

// Makes an attempt to retrieve the value from a product-rates response.
// If there is any ambiguity, returns null
const extractSimpleRateValue = (
    response: ProductRateResponse
): number | null => {
    const effectiveDates = Object.keys(response.effectiveDate);
    if (!effectiveDates.length) {
        datadogRum.addError(
            new Error(
                'product-rate::extractSimpleRateValue::no-effective-dates'
            )
        );
        return null;
    }
    let effectiveDate;

    if (effectiveDates.length === 1) {
        effectiveDate = effectiveDates[0];
    } else {
        // grab the first effective date that occurs before today's date.
        effectiveDate = effectiveDates
            .sort((a, b) => {
                return dayjs(a, ZAHARA_API_DATE_FORMAT).isBefore(
                    dayjs(b, ZAHARA_API_DATE_FORMAT)
                )
                    ? 1
                    : -1;
            })
            .find(
                (date) => !dayjs(date, ZAHARA_API_DATE_FORMAT).isAfter(dayjs())
            );
    }

    if (!effectiveDate) {
        datadogRum.addError(
            new Error(
                'product-rate::extractSimpleRateValue::invalid-effective-date'
            )
        );
        return null;
    }

    const effectiveDateValues = response.effectiveDate[effectiveDate];
    if (effectiveDateValues?.length !== 1) {
        datadogRum.addError(
            new Error(
                'product-rate::extractSimpleRateValue::more-than-one-effectiveDateValue'
            )
        );
        // we can't effectively identify which value is correct.
        return null;
    }

    const effectiveDateValue = effectiveDateValues[0];
    const ages = Object.keys(effectiveDateValue.ages);
    if (!ages?.length) {
        datadogRum.addError(
            new Error('product-rate::extractSimpleRateValue::no-ages')
        );
        return null;
    }
    if (ages.length > 1) {
        datadogRum.addError(
            new Error('product-rate::extractSimpleRateValue::more-than-one-age')
        );
        return null;
    }

    const ageValues = effectiveDateValue.ages[ages[0]];

    if (!ageValues?.length) {
        datadogRum.addError(
            new Error('product-rate::extractSimpleRateValue::no-ageValues')
        );
        return null;
    }
    if (ageValues.length > 1) {
        datadogRum.addError(
            new Error(
                'product-rate::extractSimpleRateValue::more-than-one-value'
            )
        );
        return null;
    }
    return ageValues[0];
};

const getInsuredGenderFromPolicy = (policy: PolicyDetails): string | null => {
    const insuredPartyGenders = new Set(
        policy.coveredPeople?.map(({ gender }) => gender)
    );
    if (insuredPartyGenders.size !== 1) {
        return null;
    }
    return Array.from(insuredPartyGenders)[0] ?? null;
};

const getCoverageValuesFromPolicy = (
    policy: PolicyDetails
): {
    coverageAmount: number | null;
    issueAge: number | null;
    riskClass: string | null;
} => {
    const coverageLayer = policy.coverage.getCoverageLayerByType(
        RiderType.BASE
    );
    const coverageValues = {
        coverageAmount: <number | null>null,
        issueAge: <number | null>null,
        riskClass: <string | null>null,
    };

    if (!coverageLayer) {
        return coverageValues;
    }

    coverageValues.coverageAmount = coverageLayer.currentAmount ?? null;

    if (coverageLayer?.coverageParticipants?.length !== 1) {
        // couldn't find a single coverageParticipant.  Exit early as values are ambiguous.
        return coverageValues;
    }

    coverageValues.issueAge =
        coverageLayer.coverageParticipants[0].issueAge ?? null;
    coverageValues.riskClass =
        coverageLayer.coverageParticipants[0].riskClass ?? null;

    return coverageValues;
};

// Attempts to retrieve every possible query param to add to the policy-rates requests.  Will only add determinate values
const getPolicyRatesArguments = (
    policy: PolicyDetails,
    effectiveDate: string
): string => {
    const querySearchParams = new URLSearchParams();
    querySearchParams.append('effectiveDate', effectiveDate);
    const gender = getInsuredGenderFromPolicy(policy);
    const { coverageAmount, issueAge, riskClass } =
        getCoverageValuesFromPolicy(policy);
    const contractYear = policy.policyYear ?? null;
    gender && querySearchParams.append('gender', gender);
    coverageAmount &&
        querySearchParams.append('coverageAmount', `${coverageAmount}`);
    !isNullEmptyOrUndefined(issueAge) &&
        querySearchParams.append('issueAge', `${issueAge}`);
    riskClass && querySearchParams.append('riskClass', riskClass);
    !isNullEmptyOrUndefined(contractYear) &&
        querySearchParams.append('contractYear', `${contractYear}`);

    return querySearchParams.toString();
};

// Match rate is an SBUL-specific value and will not scale to support other products
export const getSbulMatchRate = async (
    policy: PolicyDetails,
    effectiveDate: string = dayjs().format(ZAHARA_API_DATE_FORMAT)
) => {
    try {
        return await getProductRate(
            policy,
            ConfiguredSettingId.MatchRate,
            'BASE_COVERAGE',
            effectiveDate
        );
    } catch (e) {
        console.error(
            'getSbulMatchRate error |',
            (e as AxiosResponse)?.data ?? (e as Error)?.message
        );

        return null;
    }
};

export const getCurrentInterestRate = async (
    policy: PolicyDetails,
    effectiveDate: string = dayjs().format(ZAHARA_API_DATE_FORMAT)
) => {
    return await getProductRate(
        policy,
        ConfiguredSettingId.CurrentInterestRate,
        'Base_Coverage',
        effectiveDate
    );
};

export const getLoanInterestRate = async (
    policy: PolicyDetails,
    effectiveDate: string = dayjs().format(ZAHARA_API_DATE_FORMAT)
) => {
    return await getProductRate(
        policy,
        ConfiguredSettingId.LoanInterestRate,
        'Base_Coverage',
        effectiveDate
    );
};

export const getBorrowingInterestRate = async (
    policy: PolicyDetails,
    effectiveDate: string = dayjs().format(ZAHARA_API_DATE_FORMAT)
) => {
    return await getProductRate(
        policy,
        ConfiguredSettingId.BorrowingInterestRate,
        'Base_Coverage',
        effectiveDate
    );
};

export const getRiderBenefitData = async (
    policy: PolicyDetails,
    rider: Rider
): Promise<RiderBenefit | null> => {
    try {
        const benefitId = CoverageToBenefitId[rider.coverageId as CoverageId];

        let configuredSettings: ConfiguredSettingId[];
        switch (benefitId) {
            case BenefitId.ChronicIllness:
                configuredSettings = riderChronicIllnessSettings;
                break;
            case BenefitId.CriticalIllness:
                configuredSettings = riderCriticalIllnessSettings;
                break;
            case BenefitId.TerminalIllness:
                configuredSettings = riderTerminalIllnessSettings;
                break;
            case BenefitId.OverloanProtection:
                configuredSettings = riderOverloanProtectionSettings;
                break;
            default:
                configuredSettings = [];
                break;
        }

        const data = await Promise.all(
            configuredSettings.map(async (resourceId) => {
                return await getProductRate(
                    policy,
                    resourceId,
                    benefitId,
                    rider.effectiveDate
                );
            })
        );

        const riderBenefit: RiderBenefit = {
            benefitId,
            ...data.reduce((acc, curr, index) => {
                const key = configuredSettings[index];
                acc[key] = curr as number;
                return acc;
            }, {} as { [key in ConfiguredSettingId]: number }),
        };

        return riderBenefit;
    } catch (error) {
        console.error('An error occurred retrieving rider/benefit data', error);
        return null;
    }
};

export const getProductRate = async (
    policy: PolicyDetails,
    resourceId: ConfiguredSettingId,
    benefitId: string,
    effectiveDate: string = dayjs().format(ZAHARA_API_DATE_FORMAT),
    errorMessage?: string
) => {
    try {
        const { carrierId } = policy;
        let { planCode } = policy;

        if (!carrierId) {
            throw new Error('No carrierId on policy');
        }
        if (!planCode) {
            throw new Error('No planCode on policy');
        }
        if (resourceId === ConfiguredSettingId.MatchRate) {
            planCode = 'SBUL-MATCH';
        }

        const querySearchParams = getPolicyRatesArguments(
            policy,
            effectiveDate
        );
        const { data } = await client.get(
            buildClientSideProductRatePathUrl(
                carrierId,
                planCode,
                benefitId,
                resourceId,
                querySearchParams
            )
        );

        return extractSimpleRateValue(data);
    } catch (e) {
        console.error(
            errorMessage || 'getProductRate error | unspecified error message',
            (e as AxiosResponse)?.data ?? (e as Error)?.message
        );

        return null;
    }
};
