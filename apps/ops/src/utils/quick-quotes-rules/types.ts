import { UnderwritingClass } from '@deps/components/illustrations/helpers/illustrationApiSchemas';
import { TermFixedCostPeriod } from '@deps/queries/api/v3/illustrations';
import {
    NumberOrRange,
    QuickQuoteResultTableFieldName,
} from '@deps/types/quickQuote';

export type ProductName =
    | 'Term Life 10 Yr'
    | 'Term Life 15 Yr'
    | 'Term Life 20 Yr'
    | 'Term Life 30 Yr'
    | 'Return of Premium Term Life 20 Yr'
    | 'Return of Premium Term Life 30 Yr';

export type PlanCode = 'TL0101' | 'TR0101';

export type NotAvailabilityReasonField =
    | 'age'
    | 'state'
    | 'face'
    | 'adrMaxFace'
    | 'termLength'
    | 'state'
    | undefined;

export type IneligibilityReason =
    | {
          reason: 'ageOutsideOfRange';
          field: 'age';
          expected: [number, number];
          actual: number;
      }
    | {
          reason: 'riderIsGreaterThanPolicyFaceAmount';
          field: 'adrMaxFace'; // New error type to consider ADR Riders when amount is greater than product face amount
          expected: [number, number];
          actual: number;
      }
    | {
          reason: 'faceAmountOutsideOfRange';
          field: 'face';
          expected: [number, number];
          actual: number;
      }
    | {
          reason: 'nicotine';
          field: 'nicotine';
          expected: 'Y' | 'N';
          actual: 'Y' | 'N';
      }
    | {
          reason: 'underMinimumPolicyFaceAmount';
          field: 'face';
          expected: number;
          actual: number;
      }
    | {
          reason: 'stateNotEligible';
          field: 'state';
          actual: string;
      }
    | {
          reason: 'requiredRiderNotSelected';
          field: 'rider';
          notSelectedRider: RiderCode[];
      };

export interface BaseEligibilityResult {
    eligible: boolean;
    reasons: IneligibilityReason[];
}

export interface ClassEligibilityResult extends BaseEligibilityResult {
    className: string;
}

export interface RiderEligibilityResult extends BaseEligibilityResult {
    riderName: string;
    riderCode: RiderCode;
    evaluated: boolean;
}

export type ClassAlternatives = {
    nicotine: 'Y' | 'N';
    ageMin: number;
    ageMax: number;
    faceMin: number;
    faceMax: number;
};

export type RiderAlternatives = {
    ageMin?: number;
    ageMax?: number;
    faceMin?: number;
    faceMax?: number;
    policyFaceAmountMin?: number;
    notAvailableInStateCodes?: string[];
    requiredRiderCodes?: RiderCode[];
};

export type ClassRule = {
    className: string; // for debugging
    classCode: UnderwritingClass;
    alternatives: ClassAlternatives;
};

export type RiderRule = {
    riderName: string; // for debugging
    riderCode: RiderCode;
    alternatives: RiderAlternatives;
};

export type ProductRule = {
    productName: ProductName; // for debugging
    planCode: PlanCode;
    termLength: TermFixedCostPeriod;
    classes: ClassRule[];
    riders: RiderRule[];
};

export type RulesModel = {
    classOrder: string[];
    products: ProductRule[];
};
export type nonEligibleReasonByClass = {
    className: string;
    reasons: IneligibilityReason[];
};

export type ProductClassResult = {
    planCode: PlanCode;
    termLength: TermFixedCostPeriod;
    classCodes: UnderwritingClass[];
    notAvailabilityReasonField: nonEligibleReasonByClass[];
    riders: ProductClassResultRiders;
};

export type ProductClassResultRiders = {
    [K in RiderCode]: RiderEligibilityResult;
};

export interface getEligibleClassProps {
    className: string;
    alternatives: ClassAlternatives;
    age?: number;
    isNicotineUser?: boolean;
    face?: number;
}

type RiderName =
    | 'Accidental Death Benefit Rider'
    | "Children's Term Insurance Rider"
    | 'Waiver of Premium Rider'
    | 'Accelerated Death Benefit Rider for Terminal Illness'
    | 'Charitable Giving Rider'
    | 'Accelerated Death Benefit Rider for Chronic Illness';

export type RiderCode =
    | 'Rider_ADR'
    | 'Rider_CTR'
    | 'Rider_WPR'
    | 'Rider_ABRTRM'
    | 'Rider_CGR'
    | 'Rider_ABRCHR';

export const isRiderADR = (riderCode: RiderCode) => riderCode === 'Rider_ADR';

export interface PremiumRiderEligibilityList {
    riderName: RiderName;
    riderCode: RiderCode;
    riderNameCamelCase: string;
}

export interface RiderEligibilityList extends PremiumRiderEligibilityList {
    riderPath: string;
}

export interface RiderInputNormalized {
    riderName: RiderName;
    riderCode: RiderCode;
    riderRequested: boolean;
    faceAmount: number;
    riderRuleAlternatives: RiderAlternatives | undefined;
}

export type DataItem = {
    fieldName: QuickQuoteResultTableFieldName;
    termLength: number;
    period?: string;
    value: NumberOrRange | undefined;
    hasApiError: boolean;
    hasRiderErrors?: boolean;
    notAvailabilityReasons?: IneligibilityReason[];
};

export type RiderInegilibilityReason = {
    termLengths: number[];
    reasons?: IneligibilityReason[] | undefined;
};

export type RiderDataItem = Omit<
    DataItem,
    'notAvailabilityReasons' | 'termLength' | 'fieldName' | 'hasApiError'
> & {
    notAvailabilityReasons?: RiderInegilibilityReason[];
};
