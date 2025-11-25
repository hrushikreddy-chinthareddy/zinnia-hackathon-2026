import { DataDefinition } from '@deps/types/data';
import { DeathBenefit, Policy } from '@zinnia/api-types/types/sor';

export type DeathBenefitDto = DeathBenefit;

export const toDeathBenefitDto = (policy: Policy): DeathBenefitDto =>
    policy.deathBenefit as DeathBenefit;

export const PolicyDeathBenefitInfo = (): DataDefinition<DeathBenefitDto>[] => [
    {
        key: 'deathBenefitOption',
        label: 'Death Benefit Option',
    },
    {
        key: 'deathBenefitOptionEffectiveDate',
        label: 'Death Benefit Option Effective Date',
    },
    {
        key: 'deathBenefitOptionChangedEffectiveDate',
        label: 'Change in Death Benefit Option Effective Date',
    },
];
