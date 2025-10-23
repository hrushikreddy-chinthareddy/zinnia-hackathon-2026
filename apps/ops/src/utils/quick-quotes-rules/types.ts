import { TermFixedCostPeriod } from '@deps/queries/api/v3/illustrations';
import {
    NoParamRider,
    PremiumFreeRider,
    RiderWithFaceAmount,
} from '@deps/types/quickQuote';

export type ProductName =
    | 'Term Life 10 Yr'
    | 'Term Life 15 Yr'
    | 'Term Life 20 Yr'
    | 'Term Life 30 Yr'
    | 'Return of Premium Term Life 20 Yr'
    | 'Return of Premium Term Life 30 Yr';

export type PlanCode = 'TL0101' | 'TR0101';

export type NotAvailabilityReasonField = 'age' | 'state' | 'face' | undefined;

export type ClassAlternatives = {
    nicotine: 'Y' | 'N';
    ageMin: number;
    ageMax: number;
    faceMin: number;
    faceMax: number;
};

export type RiderAlternatives = {
    ageMin: number;
    ageMax: number;
    faceMin?: number;
    faceMax?: number;
};

export type ClassRule = {
    className: string; // for debugging
    classCode: string;
    alternatives: ClassAlternatives;
};

export type RiderRule = {
    riderName: string; // for debugging
    riderCode: string;
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

export type ProductClassResult = {
    planCode: PlanCode;
    termLength: TermFixedCostPeriod;
    classCodes: string[];
    notAvailabilityReasonField: NotAvailabilityReasonField;
    riders: ProductClassResultRiders;
};

export type ProductClassResultRiders = {
    [K in RiderWithFaceAmount | NoParamRider | PremiumFreeRider]+?:
        | boolean
        | NotAvailabilityReasonField;
};
