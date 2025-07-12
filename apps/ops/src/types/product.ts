export interface Product {
    productMasterId: string;
    carrierProductId: string;
    productId: string;
    productMarketingName: string;
    carrier: string;
    productLine: string;
    productType: ProductType;
    planCode: string;
    termLength: Array<number>;
    availableToSell: boolean;
    id: string;
}

export enum ProductTypes {
    INDEX_UNIVERSAL_LIFE = 'INDEX_UNIVERSAL_LIFE',
    UNIVERSAL_LIFE = 'UNIVERSAL_LIFE',
    TERM = 'TERM',
}

export type ProductType =
    | ProductTypes.INDEX_UNIVERSAL_LIFE
    | ProductTypes.UNIVERSAL_LIFE
    | ProductTypes.TERM;

export const ProductTypeLabel: Map<ProductType, string> = new Map([
    [ProductTypes.INDEX_UNIVERSAL_LIFE, 'IUL'],
    [ProductTypes.UNIVERSAL_LIFE, 'UL'],
    [ProductTypes.TERM, 'Term'],
]);
