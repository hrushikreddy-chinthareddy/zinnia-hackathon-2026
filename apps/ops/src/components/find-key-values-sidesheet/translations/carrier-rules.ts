import { LineOfBusiness, ProductType } from '@zinnia/api-types/types/sor';

type ExceptionalPlanCode = string;

const LIFE_ONLY = new Set([LineOfBusiness.LIFE]);
const ANNUITY_ONLY = new Set([LineOfBusiness.ANNUITY]);
const UL_IUL_TR0101 = new Set([
    ProductType.UNIVERSALLIFE,
    ProductType.INDEXEDUNIVERSALLIFE,
    'TR0101',
]);
const ANNUITY_UL_IUL = new Set([
    LineOfBusiness.ANNUITY,
    ProductType.UNIVERSALLIFE,
    ProductType.INDEXEDUNIVERSALLIFE,
]);

/**
 * Controls section visibility based on line of business, product type, and plan code
 *
 * @param node - node to filter
 * @param lineOfBusiness - line of business
 * @param productType - product type
 * @param planCode - plan code as string
 * @returns filtered node
 */
export const sectionVisibility: Record<
    string,
    Set<LineOfBusiness | ProductType | ExceptionalPlanCode> | undefined
> = {
    loans: UL_IUL_TR0101,
    marketValueAdjustment: ANNUITY_ONLY,
    withdrawalValues: ANNUITY_UL_IUL,
    testValues: LIFE_ONLY,
    requiredMinimumDistribution: ANNUITY_ONLY,
    combinedFunds: ANNUITY_UL_IUL,
    premiumBonus: ANNUITY_ONLY,
};
