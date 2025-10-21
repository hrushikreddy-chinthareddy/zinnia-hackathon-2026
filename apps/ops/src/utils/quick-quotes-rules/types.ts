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

export type ClassRule = {
    className: string; // for debugging
    classCode: string;
    alternatives: ClassAlternatives;
};

export type ProductRule = {
    productName: ProductName; // for debugging
    planCode: PlanCode;
    termLength: number;
    classes: ClassRule[];
};

export type RulesModel = {
    classOrder: string[];
    products: ProductRule[];
};

export type ProductClassResult = {
    planCode: PlanCode;
    termLength: number;
    classCodes: string[];
    notAvailabilityReasonField: string;
};
