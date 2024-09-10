import { TFunction } from 'next-i18next';

import { numberFormatify } from '@deps/helpers/numbers.helper';
import { getBankDetails, getParty } from '@deps/helpers/payments.helper';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { BankAccount, Policy, Reason } from '@deps/models/policy/sor-policy';
import { DataDefinition } from '@deps/types/data';

export interface PolicySummaryColDto {
    upcomingMonthlyPremium?: string;
    maturityDate?: string;
    issueDate: string;
    baseDeathBenefit?: number;
    accountValue?: number;
    surrenderValue?: number;
    upcomingPremium: IUpcomingPremium;
}

export interface IUpcomingPremium {
    policy: Policy;
    amount?: number;
    paymentDate?: string;
    bankAccount?: BankAccount;
}

export const toPolicySummaryColDto = (policy: Policy): PolicySummaryColDto => {
    if (!policy) return policy;
    const { accountValues, coverage, systematicPrograms, policyDates, parties = [] } = policy;
    const upcomingPremium = systematicPrograms?.find(sp => sp.reason === Reason.PREMIUM);

    const baseDeathBenefit = coverage?.coverageLayers?.[0]?.currentAmount;

    const paymentDate = upcomingPremium?.nextProgramDate;
    const payorParty = getParty(parties, upcomingPremium);
    const payorBankDetails = getBankDetails(payorParty, upcomingPremium);

    const accountNumber = payorBankDetails?.accountNumber?.substring(payorBankDetails?.accountNumber.length - 4);

    return {
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
    };
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
