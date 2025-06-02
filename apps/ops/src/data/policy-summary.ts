import { BankAccount, Policy, FeatureType, Reason } from '@zinnia/api-types/types/sor';
import { TFunction } from 'next-i18next';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { getBankDetails, getParty } from '@deps/helpers/payments.helpers';
import { convertKebabedDateString, isNullEmptyOrUndefined, translateYearOrYears } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import { DataDefinition } from '@deps/types/data';

export interface PolicySummaryColDto {
    freeLookExpirationDate?: string;
    upcomingMonthlyPremium?: string;
    maturityDate?: string;
    issueDate: string;
    baseDeathBenefit?: number;
    accountValue?: number;
    surrenderValue?: number;
    upcomingPremium: IUpcomingPremium;
    fixedCostPeriod?: string;
    fixedCostPeriodLeft?: string;
}

export interface IUpcomingPremium {
    policy: Policy;
    amount?: number;
    paymentDate?: string;
    bankAccount?: BankAccount;
}

export const toPolicySummaryColDto = (policy: Policy, t?: TFunction): PolicySummaryColDto => {
    if (!policy) return policy;
    const {
        accountValues,
        coverage,
        fixedCostPeriod,
        systematicPrograms,
        policyDates,
        policyYear,
        parties = [],
        policyFeatures = [],
    } = policy;
    const upcomingPremium = systematicPrograms?.find(sp => sp.reason === Reason.PREMIUM);

    const baseDeathBenefit = coverage?.coverageLayers?.[0]?.currentAmount;

    const paymentDate = upcomingPremium?.nextProgramDate;
    const payorParty = getParty(parties, upcomingPremium);
    const payorBankDetails = getBankDetails(payorParty, upcomingPremium);

    const freeLookFeature = (policyFeatures ?? []).find(feature => ['freelook', FeatureType.FREELOOK].includes(feature.featureType || ''));

    const accountNumber = payorBankDetails?.accountNumber?.substring(payorBankDetails?.accountNumber.length - 4);
    const fixedCostPeriodLeft =
        !isNullEmptyOrUndefined(fixedCostPeriod as number) && !isNullEmptyOrUndefined(policyYear as number)
            ? t && t('temporal.timeLeft', { timespan: translateYearOrYears((fixedCostPeriod as number) - Number(policyYear), t) })
            : DEFAULT_ERROR_STRING;

    const result = {
        freeLookExpirationDate: freeLookFeature?.endDate,
        upcomingMonthlyPremium: `${upcomingPremium?.amount},${convertKebabedDateString(paymentDate || '')},${accountNumber || 'empty'},${
            payorBankDetails?.accountType
        },${policy.policyNumber}`,
        maturityDate: policyDates?.maturityDate,
        issueDate: convertKebabedDateString(policyDates?.issueDate),
        baseDeathBenefit: baseDeathBenefit,
        accountValue: accountValues?.endingAccountValue,
        surrenderValue: accountValues?.surrenderValue,
        upcomingPremium: {
            policy: policy,
            amount: upcomingPremium?.amount,
            paymentDate: paymentDate,
            bankAccount: payorBankDetails,
        },
        fixedCostPeriod: translateYearOrYears(fixedCostPeriod, t),
        fixedCostPeriodLeft,
    };

    return result;
};

export const getPolicySummaryColDefs = (t: TFunction): DataDefinition<PolicySummaryColDto>[] => [
    {
        key: 'upcomingMonthlyPremium',
        label: t('upcomingMonthlyPremium'),
    },
    {
        key: 'issueDate',
        label: t('issueDate'),
    },
    {
        key: 'maturityDate',
        label: t('maturityDate'),
        format: convertKebabedDateString,
    },
    {
        key: 'baseDeathBenefit',
        label: t('baseDeathBenefit'),
        format: numberFormatify,
        col: 2,
        tooltip: t('baseDeathBenefitTooltip') as string,
    },
    {
        key: 'accountValue',
        label: t('accountValue'),
        format: numberFormatify,
        col: 2,
        tooltip: t('accountValueTooltip') as string,
    },
    {
        key: 'surrenderValue',
        label: t('surrenderValue'),
        format: numberFormatify,
        col: 2,
        tooltip: t('surrenderValueTooltip') as string,
    },
];
