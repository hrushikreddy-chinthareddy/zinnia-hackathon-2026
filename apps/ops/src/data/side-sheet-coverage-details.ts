import { Policy } from '@zinnia/api-types/types/sor';
import { DEFAULT_ERROR_STRING } from '@zinnia/utils';
import { TFunction } from 'next-i18next';

import { PopoverPlacement } from '@deps/components/popover/popover';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { DataDefinition } from '@deps/types/data';

export interface SideSheetCoverageColDto {
    baseDeathBenefit?: number;
    coverageChangeUnit?: number;
    changesAllowedInPolicyYear?: string;
    minCoverageAmount?: number;
    maxCoverageAmount?: number;
    availableDecrease: number;
    availableIncrease: number;
    issueDate?: string;
    policyAge: string;
    eligibleForIncreaseUntil: string;
}

export const toSideSheetCoverageDto = (policy: Policy): SideSheetCoverageColDto => {
    if (!policy) return policy;

    const { coverage, policyYear } = policy;

    const baseDeathBenefit = coverage?.coverageLayers?.[0]?.currentAmount ?? 0;

    const changesAllowedInPolicyYear = String(coverage?.maximumAnnualCoverageChangeAllowedPerPolicy);

    const coverageChangeUnit = coverage?.minimumCoverageDecreaseAmount;

    const maxCoverageAmount = coverage?.maximumCoverageAmount ?? 0;

    const minCoverageAmount = coverage?.minimumCoverageAmount ?? 0;

    const availableDecrease = coverage?.maximumCoverageDecreaseAmount ?? 0;

    const availableIncrease = coverage?.maximumCoverageIncreaseAmount ?? 0;

    const policyAge = policyYear ?? 0 < 1 ? '1 year' : policyYear === 1 ? '1 year' : `${policyYear} years`;

    const issueDate = policy.policyDates?.issueDate;

    const eligibleForIncreaseUntil =
        String(coverage?.maximumAgeNumberCoverageAmountIncrease === 0 ? 'N/A' : coverage?.maximumAgeNumberCoverageAmountIncrease) ??
        DEFAULT_ERROR_STRING;

    return {
        baseDeathBenefit,
        coverageChangeUnit,
        changesAllowedInPolicyYear,
        minCoverageAmount,
        maxCoverageAmount,
        availableDecrease,
        availableIncrease,
        issueDate,
        policyAge,
        eligibleForIncreaseUntil,
    };
};

export const getSideSheetCoverageColDefs = (t: TFunction): DataDefinition<SideSheetCoverageColDto>[] => [
    {
        key: 'baseDeathBenefit',
        label: t('baseDeathBenefit'),
        tooltip: t('baseDeathBenefit') as string,
        format: numberFormatify,
    },
    {
        key: 'coverageChangeUnit',
        label: t('coverageChangeUnit'),
        tooltip: t('coverageChangeUnit') as string,
        format: numberFormatify,
    },
    {
        key: 'changesAllowedInPolicyYear',
        label: t('changesAllowedInPolicyYear'),
        col: 2,
    },
    {
        key: 'minCoverageAmount',
        label: t('minCoverageAmount'),
        tooltip: t('minCoverageAmount') as string,
        format: numberFormatify,
    },
    {
        key: 'maxCoverageAmount',
        label: t('maxCoverageAmount'),
        tooltip: t('maxCoverageAmount') as string,
        tooltipPlacement: PopoverPlacement.TopLeft,
        col: 2,
        format: numberFormatify,
    },
    {
        key: 'availableDecrease',
        label: t('availableDecrease'),
        tooltip: t('availableDecrease') as string,
        format: numberFormatify,
    },
    {
        key: 'availableIncrease',
        label: t('availableIncrease'),
        tooltip: t('availableIncrease') as string,
        tooltipPlacement: PopoverPlacement.TopLeft,
        col: 2,
        format: numberFormatify,
    },
    {
        key: 'issueDate',
        label: t('issueDate'),
        format: convertKebabedDateString,
    },
    {
        key: 'policyAge',
        label: t('policyAge'),
        col: 2,
    },
    {
        key: 'eligibleForIncreaseUntil',
        label: t('eligibleForIncreaseUntil'),
        col: 2,
    },
];
