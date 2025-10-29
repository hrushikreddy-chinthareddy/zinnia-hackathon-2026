import {
    LineOfBusiness,
    ProductType,
} from '@xd/api-types/dist/generated-types/sor';

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
const NEVER = new Set([]);
/**
 * Fields that should not be displayed
 */
export const sectionVisibility: Record<
    string,
    Set<LineOfBusiness | ProductType | ExceptionalPlanCode>
> = {
    // policy
    loanValues: UL_IUL_TR0101,
    marketValueAdjustment: ANNUITY_ONLY,
    withdrawalValues: ANNUITY_UL_IUL,
    testValues: LIFE_ONLY,
    requiredMinimumDistribution: ANNUITY_ONLY,
    allocation: ANNUITY_UL_IUL,
    partyRoles: NEVER,
    parties: NEVER,

    // transaction
    taxBasis: NEVER,
    taxWithholdingInstructions: NEVER,
    taxWithheldAmounts: NEVER,
};
