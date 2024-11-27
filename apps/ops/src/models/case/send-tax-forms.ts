export type TaxForm = {
    contractNumber: string;
    name: string;
    fChar: string;
    formId: string;
    taxYear: string;
};

export type SearchTaxFormRequestBody = {
    contractNumber: string;
    numYears?: number;
    clientCode: string;
    taxYear?: number;
};

export type SearchTaxFormResponseBody = {
    count: number;
    items: TaxForm[];
};
