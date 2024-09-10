import { TFunction } from 'next-i18next';

import { convertKebabedDateString } from '@deps/helpers/string.helper';
import { DeathBenefit, Policy, PolicyCoverage } from '@deps/models/policy/sor-policy';

import { buildInsuredData } from '../policy-details/policy-details.helper';
import { InsuredCardData } from '../shared-cards/insured/insured-card.helper';

export interface ContestabilityCardData {
    endDate?: string | null;
    startDate: string;
}

interface CoveragePageData {
    contestability: ContestabilityCardData;
    coverage?: PolicyCoverage;
    currency?: string;
    deathBenefit?: DeathBenefit;
    insured: InsuredCardData;
    netAmountAtRisk?: number;
    planCode?: string;
}

export const mapCoverageData = (policy: Policy, t: TFunction): CoveragePageData => {
    const { coverage, currency, deathBenefit, product, accountValues, policyDates } = policy;
    const { contestabilityEndDate, contestabilityStartDate } = policyDates ?? {};
    const { planCode } = product ?? {};

    return {
        coverage,
        currency,
        deathBenefit,
        insured: buildInsuredData(policy, t),
        contestability: {
            endDate: convertKebabedDateString(contestabilityEndDate),
            startDate: convertKebabedDateString(contestabilityStartDate),
        },
        netAmountAtRisk: accountValues?.netAmountAtRisk,
        planCode,
    };
};
