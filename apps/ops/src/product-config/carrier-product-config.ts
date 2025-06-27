import { ProductType } from '@zinnia/api-types/types/sor';

import {
    ProductOverrides,
    ProductTypeVisibilityRules,
} from '../types/policy-visibility';

// Base visibility rules by product type
export const productTypeVisibilityRules: ProductTypeVisibilityRules = {
    // Term products don't show these features by default
    [ProductType.TERM]: {
        allowsLoans: false,
        allowsWithdrawals: false,
        allowsFundsAndAccounts: false,
    },
    // Add more product types as needed
};

// This can be expanded with more carriers and products as needed
export const planCodeProductOverrides: Record<string, ProductOverrides> = {
    // Override rules for specific planCodes
};
