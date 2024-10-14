import { Policy, PolicyCoverage } from '@deps/models/policy/sor-policy';
import { DataDefinition } from '@deps/types/data';

export type PolicyCoverageDto = PolicyCoverage;

export const toCoverageDto = (policy: Policy): PolicyCoverageDto => policy.coverage as PolicyCoverage;

export const PolicyCoverageInfo = (): DataDefinition<PolicyCoverageDto>[] => [
    {
        key: 'totalCoverageAmount',
        label: 'Total Coverage Amount',
    },
    {
        key: 'minimumCoverageAmount',
        label: 'Minimum Coverage Amount',
    },
    {
        key: 'cumulativeGrossDeathBenefitAmount',
        label: 'Cumulative Gross Death Benefit',
    },
    {
        key: 'maximumCoverageAmount',
        label: 'Maximum Coverage Amount',
    },
    {
        key: 'coverageChangeEffectiveDate',
        label: 'Earliest Coverage Change Date',
    },
    {
        key: 'coverageBand',
        label: 'Band',
    },
    {
        key: 'maximumAnnualCoverageChangeAllowedPerPolicy',
        label: 'Maximum Annual Coverage Change Allowed Per Policy',
    },
];

export const PolicyDecreaseInfo = (): DataDefinition<PolicyCoverage>[] => [
    {
        key: 'minimumCoverageDecreaseAmount',
        label: 'Minimum Coverage Amount Decrease',
    },
    {
        key: 'maximumCoverageDecreaseAmount',
        label: 'Maximum Coverage Amount Decrease',
    },
    {
        key: 'maximumAgeNumberCoverageAmountDecrease',
        label: 'Maximum Age of No Coverage Amount Decrease',
    },
    {
        key: 'coverageAmountDecreaseAllowed',
        label: 'Number of Coverage Amount Decrease Allowed Per Policy Year',
    },
];

export const PolicyIncreaseInfo = (): DataDefinition<PolicyCoverage>[] => [
    {
        key: 'minimumCoverageIncreaseAmount',
        label: 'Minimum Coverage Amount Increase',
    },
    {
        key: 'maximumCoverageIncreaseAmount',
        label: 'Maximum Coverage Amount Increase',
    },
    {
        key: 'maximumAgeNumberCoverageAmountIncrease',
        label: 'Maximum Age of No Coverage Amount Increase',
    },
    {
        key: 'coverageAmountIncreaseAllowed',
        label: 'Number of Coverage Amount Increase Allowed Per Policy Year',
    },
];
