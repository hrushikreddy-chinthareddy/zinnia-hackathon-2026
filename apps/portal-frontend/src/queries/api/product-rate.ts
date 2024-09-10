import { datadogRum } from '@datadog/browser-rum';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';

import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { CoverageLayer, PartyRole, Policy, PolicyAllOfPartiesItem, PolicyParties, Rider } from '@deps/models/policy/sor-policy';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import {
    BenefitId,
    CoverageToBenefitId,
    ConfiguredSettingId,
    RiderBenefit,
    riderChronicIllnessSettings, 
    riderCriticalIllnessSettings,
    riderTerminalIllnessSettings,
    riderOverloanProtectionSettings,
    CoverageId,
    ProductRateQueryProps
} from '@deps/types/product-rate';

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

const buildClientSideProductRatePathUrl = (carrierCode: string, planCode: string, benefitCode?: string, resource?: ConfiguredSettingId, querySearchParams?: string): string => {
    return `${appUrlCarriers}/${carrierCode}/products/${planCode}/benefits/${benefitCode}/configured-settings/${resource}${querySearchParams ? `?${querySearchParams}` : ''}`;
};

// Makes an attempt to retrieve the value from a product-rates response.
// If there is any ambiguity, returns null
const extractSimpleRateValue = (response: ProductRateResponse): number | null => {
    const effectiveDates = Object.keys(response.effectiveDate);
    if (!effectiveDates.length) {
        datadogRum.addError(new Error('product-rate::extractSimpleRateValue::no-effective-dates'));
        return null;
    }
    let effectiveDate;

    if (effectiveDates.length === 1) {
        effectiveDate = effectiveDates[0];
    } else {
        // grab the first effective date that occurs before today's date.
        effectiveDate = effectiveDates
            .sort((a, b) => {
                return dayjs(a, ZAHARA_API_DATE_FORMAT).isBefore(dayjs(b, ZAHARA_API_DATE_FORMAT)) ? 1 : -1;
            })
            .find(date => !dayjs(date, ZAHARA_API_DATE_FORMAT).isAfter(dayjs()));
    }

    if (!effectiveDate) {
        datadogRum.addError(new Error('product-rate::extractSimpleRateValue::invalid-effective-date'));
        return null;
    }

    const effectiveDateValues = response.effectiveDate[effectiveDate];
    if (effectiveDateValues?.length !== 1) {
        datadogRum.addError(new Error('product-rate::extractSimpleRateValue::more-than-one-effectiveDateValue'));
        // we can't effectively identify which value is correct.
        return null;
    }

    const effectiveDateValue = effectiveDateValues[0];
    const ages = Object.keys(effectiveDateValue.ages);
    if (!ages?.length) {
        datadogRum.addError(new Error('product-rate::extractSimpleRateValue::no-ages'));
        return null;
    }
    if (ages.length > 1) {
        datadogRum.addError(new Error('product-rate::extractSimpleRateValue::more-than-one-age'));
        return null;
    }

    const ageValues = effectiveDateValue.ages[ages[0]];

    if (!ageValues?.length) {
        datadogRum.addError(new Error('product-rate::extractSimpleRateValue::no-ageValues'));
        return null;
    }
    if (ageValues.length > 1) {
        datadogRum.addError(new Error('product-rate::extractSimpleRateValue::more-than-one-value'));
        return null;
    }
    return ageValues[0];
};

const getInsuredGenderFromPolicy = (partyRoles?: PolicyParties[], parties?: PolicyAllOfPartiesItem[]): string | null => {
    const insuredPartyIds = partyRoles?.filter(role => role.partyRole === PartyRole.INSURED).map(({ partyId }) => partyId);
    const insuredPartyGenders = Array.from(
        new Set(parties?.filter(party => insuredPartyIds?.includes(party.partyId)).map(party => party.gender))
    );
    if (insuredPartyGenders.length !== 1) {
        return null;
    }
    return insuredPartyGenders[0] ?? null;
};

const getCoverageValuesFromPolicy = (coverageLayers?: CoverageLayer[]): { coverageAmount: number | null; issueAge: number | null; riskClass: string | null } => {
    const coverageValues = {
        coverageAmount: <number | null>null,
        issueAge: <number | null>null,
        riskClass: <string | null>null,
    };
    let coverageLayer;
    if (!coverageLayers?.length) {
        return coverageValues;
    }
    if (coverageLayers.length > 1) {
        // try to find the right coverage layer.  Return if ambiguous.
        const baseCoverageLayers = coverageLayers.filter(layer => layer.coverageType === 'BASE');
        if (baseCoverageLayers.length === 1) {
            coverageLayer = baseCoverageLayers[0];
        } else {
            // couldn't find a single coverageLayer
            return coverageValues;
        }
    } else {
        coverageLayer = coverageLayers[0];
    }

    coverageValues.coverageAmount = coverageLayer.currentAmount ?? null;

    if (coverageLayer?.coverageParticipants?.length !== 1) {
        // couldn't find a single coverageParticipant.  Exit early as values are ambiguous.
        return coverageValues;
    }

    coverageValues.issueAge = coverageLayer.coverageParticipants[0].issueAge ?? null;
    coverageValues.riskClass = coverageLayer.coverageParticipants[0].riskClass ?? null;

    return coverageValues;
};

// Attempts to retrieve every possible query param to add to the policy-rates requests.  Will only add determinate values
const getPolicyRatesArguments = (
    coverageLayers?: CoverageLayer[],
    partyRoles?: PolicyParties[],
    parties?: PolicyAllOfPartiesItem[],
    policyYear?: number, 
    effectiveDate?: string): string => {
    const querySearchParams = new URLSearchParams();
    querySearchParams.append('effectiveDate', effectiveDate || 'null');

    const gender = getInsuredGenderFromPolicy(partyRoles, parties);
    const { coverageAmount, issueAge, riskClass } = getCoverageValuesFromPolicy(coverageLayers);
    const contractYear = policyYear ?? null;
    gender && querySearchParams.append('gender', gender);
    coverageAmount && querySearchParams.append('coverageAmount', `${coverageAmount}`);
    !isNullEmptyOrUndefined(issueAge) && querySearchParams.append('issueAge', `${issueAge}`);
    riskClass && querySearchParams.append('riskClass', riskClass);
    !isNullEmptyOrUndefined(contractYear) && querySearchParams.append('contractYear', `${contractYear}`);

    return querySearchParams.toString();
};

const getProductRatePayload = (policy: Policy, benefitId: string, effectiveDate?: string, resourceId?: ConfiguredSettingId): ProductRateQueryProps => {
    return {
        benefitId,
        carrierId: policy.carrierId,
        coverageLayers: policy.coverage?.coverageLayers,
        effectiveDate: effectiveDate || dayjs().format(ZAHARA_API_DATE_FORMAT),
        errorMessage: '',
        planCode: policy.product?.planCode,
        partyRoles: policy.partyRoles,
        parties: policy.parties,
        policyYear: policy.policyYear,
        resourceId
    }
}

// Match rate is an SBUL-specific value and will not scale to support other products
export const getSbulMatchRate = async (policy: Policy, effectiveDate: string = dayjs().format(ZAHARA_API_DATE_FORMAT)) => {
    try {
        const sbulMatchPolicy = structuredClone(policy);
        if (!sbulMatchPolicy.product) {
            throw new Error('No product found');
        } else {
            sbulMatchPolicy.product.planCode = 'SBUL-MATCH';
        }
        const productRatePayload = getProductRatePayload(sbulMatchPolicy, 'Base_Coverage', effectiveDate, ConfiguredSettingId.MatchRate);

        return await getProductRate({ ...productRatePayload, errorMessage: 'product-rate::getSbulMatchRate::error' });
    } catch (e) {
        console.error('getSbulMatchRate error |', (e as AxiosResponse)?.data ?? (e as Error)?.message);

        return null;
    }
};

export const getCurrentInterestRate = async (policy: Policy, effectiveDate: string = dayjs().format(ZAHARA_API_DATE_FORMAT)) => {
    const productRatePayload = getProductRatePayload(policy, 'Base_Coverage', effectiveDate, ConfiguredSettingId.CurrentInterestRate);

    return await getProductRate({ ...productRatePayload, errorMessage: 'product-rate::getCurrentInterestRate::error' });
};

export const getLoanInterestRate = async (policy: Policy, effectiveDate: string = dayjs().format(ZAHARA_API_DATE_FORMAT)) => {
    const productRatePayload = getProductRatePayload(policy, 'Base_Coverage', effectiveDate, ConfiguredSettingId.LoanInterestRate);

    return await getProductRate({ ...productRatePayload, errorMessage: 'product-rate::getLoanInterestRate::error' });
};

export const getBorrowingInterestRate = async (policy: Policy, effectiveDate: string = dayjs().format(ZAHARA_API_DATE_FORMAT)) => {
    const productRatePayload = getProductRatePayload(policy, 'Base_Coverage', effectiveDate, ConfiguredSettingId.BorrowingInterestRate);

    return await getProductRate({ ...productRatePayload, errorMessage: 'product-rate::getBorrowingInterestRate::error' });
};

export const getRiderBenefitData = async (policy: Policy, rider: Rider): Promise<RiderBenefit | null> => {
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
                const productRatePayload = getProductRatePayload(policy, benefitId, rider.effectiveDate, resourceId);
                
                return await getProductRate(productRatePayload);
            })
        )
            
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

export const getProductRate = async ({ 
        benefitId,
        carrierId,
        coverageLayers,
        effectiveDate = dayjs().format(ZAHARA_API_DATE_FORMAT),
        errorMessage,
        planCode,
        partyRoles,
        parties, 
        policyYear,
        resourceId,
    }: ProductRateQueryProps
) => {
    try {
        if (!carrierId) {
            throw new Error('No carrierId on policy');
        }
        if (!planCode) {
            throw new Error('No planCode on policy');
        }

        const querySearchParams = getPolicyRatesArguments(coverageLayers, partyRoles, parties, policyYear, effectiveDate);
        const { data } = await client.get(
            buildClientSideProductRatePathUrl(carrierId, planCode, benefitId, resourceId, querySearchParams)
        );

        return extractSimpleRateValue(data);
    } catch (e) {
        console.error(errorMessage || 'getProductRate error | unspecified error message', (e as AxiosResponse)?.data ?? (e as Error)?.message);

        return null;
    }
}
