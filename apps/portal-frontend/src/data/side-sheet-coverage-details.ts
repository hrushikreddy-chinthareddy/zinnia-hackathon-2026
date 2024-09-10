import { TFunction } from 'next-i18next';

import { PopoverPlacement } from '@deps/components/popover/popover';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { Policy } from '@deps/models/policy/sor-policy';
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

    const coverageChangeUnit = coverage?.coverageLayers?.[0]?.valuePerUnitOfCoverage;

    const changesAllowedInPolicyYear = String(coverage?.maximumAnnualCoverageChangeAllowedPerPolicy);

    const minCoverageAmount = coverage?.coverageLayers?.[0]?.minimumCoverageAmount ?? 0;

    const maxCoverageAmount = coverage?.coverageLayers?.[0]?.maximumCoverageAmount ?? 0;

    const availableDecrease = baseDeathBenefit - minCoverageAmount;

    const availableIncrease = maxCoverageAmount - baseDeathBenefit;

    const policyAge = policyYear ?? 0 < 1 ? '1 year' : policyYear === 1 ? '1 year' : `${policyYear} years`;

    return {
        baseDeathBenefit: baseDeathBenefit,
        coverageChangeUnit: coverageChangeUnit,
        changesAllowedInPolicyYear: changesAllowedInPolicyYear,
        minCoverageAmount: minCoverageAmount,
        maxCoverageAmount: maxCoverageAmount,
        availableDecrease: availableDecrease,
        availableIncrease: availableIncrease,
        issueDate: policy.policyDates?.issueDate,
        policyAge: policyAge,
        //field not yet available as mentioned in DEPU-812
        eligibleForIncreaseUntil: '51 years old',
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
