import { ProductType } from '@zinnia/api-types/types/sor';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';

import {
    planCodeProductOverrides,
    productTypeVisibilityRules,
} from '../../product-config/carrier-product-config';
import { DetailLinkType } from '../../types/policy-visibility';

type FeatureKey =
    | 'loans'
    | 'withdrawals'
    | 'fundsAndAccounts'
    | 'premiums'
    | 'rmd';

const featureMap: Record<
    FeatureKey,
    keyof NonNullable<(typeof productTypeVisibilityRules)[ProductType]>
> = {
    loans: 'allowsLoans',
    withdrawals: 'allowsWithdrawals',
    fundsAndAccounts: 'allowsFundsAndAccounts',
    premiums: 'allowPremiums',
    rmd: 'allowRMD',
};

export const getPolicyVisibility = async (
    policy: PolicyDetails
): Promise<{
    showFundsAndAccounts: boolean;
    showLoans: boolean;
    showWithdrawals: boolean;
    showPremiums: boolean;
    showRMD: boolean;
    detailLinkType: DetailLinkType;
}> => {
    const productType = policy.productType as ProductType | undefined;
    const planCode = policy.planCode;

    const baseRules = productType && productTypeVisibilityRules[productType];
    const overrides = planCode && planCodeProductOverrides[planCode];

    const featureVisibility: Record<FeatureKey, boolean> = {
        loans: !policy.isAnnuity && policy.isTPA,
        withdrawals: policy.isTPA,
        fundsAndAccounts: policy.isTPA,
        premiums: policy.isTPA,
        rmd: policy.isTPA,
    };

    (Object.keys(featureVisibility) as FeatureKey[]).forEach((feature) => {
        const key = featureMap[feature];

        // Step 1: Apply base rules if available
        if (baseRules && key in baseRules) {
            featureVisibility[feature] = baseRules[key];
        }

        // Step 2: Apply planCode overrides if defined
        if (overrides && key in overrides && overrides[key] !== undefined) {
            featureVisibility[feature] = overrides[key]!;
        }
    });

    return {
        showFundsAndAccounts: featureVisibility.fundsAndAccounts,
        showLoans: featureVisibility.loans,
        showWithdrawals: featureVisibility.withdrawals,
        showPremiums: featureVisibility.premiums,
        showRMD: featureVisibility.rmd,
        detailLinkType: policy.isAnnuity
            ? DetailLinkType.Contract
            : DetailLinkType.Policy,
    };
};
