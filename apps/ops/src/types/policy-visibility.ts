import { ProductType } from '@zinnia/api-types/types/sor';

export enum DetailLinkType {
    Contract = 'contractDetails',
    Policy = 'policyDetails',
}

type VisibilityFlags = {
    allowsLoans: boolean;
    allowsWithdrawals: boolean;
    allowsFundsAndAccounts: boolean;
};

// Base visibility rules by product type
export type ProductOverrides = Partial<VisibilityFlags>;

export type ProductTypeVisibilityRules = Partial<
    Record<ProductType, VisibilityFlags>
>;
