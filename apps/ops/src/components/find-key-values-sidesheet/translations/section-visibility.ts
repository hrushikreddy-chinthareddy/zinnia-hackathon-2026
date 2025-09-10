import {
    LineOfBusiness,
    ProductType,
} from '@xd/api-types/dist/generated-types/sor';

import { DataKey } from '../types';

const LIFEONLY = new Set([LineOfBusiness.LIFE]);
const ANNUITYONLY = new Set([LineOfBusiness.ANNUITY]);
const ULIUL = new Set([
    ProductType.UNIVERSALLIFE,
    ProductType.INDEXEDUNIVERSALLIFE,
]);
const ANNUITYULIUL = new Set([
    LineOfBusiness.ANNUITY,
    ProductType.UNIVERSALLIFE,
    ProductType.INDEXEDUNIVERSALLIFE,
]);
const NEVER = new Set([]);
/**
 * Fields that should not be displayed
 */
export const sectionVisibility: Record<
    DataKey,
    Set<LineOfBusiness | ProductType>
> = {
    loanValues: ULIUL,
    marketValueAdjustment: ANNUITYONLY,
    withdrawalValues: ANNUITYULIUL,
    testValues: LIFEONLY,
    requiredMinimumDistribution: ANNUITYONLY,
    allocation: ANNUITYULIUL,
    partyRoles: NEVER,
    parties: NEVER,
};
