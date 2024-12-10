export type TaxForm = {
    contractNumber: string;
    name: string;
    fChar: string;
    formId: string;
    taxYear: string;
};
export const ALLOWED_TAX_YEARS = 5;
export type TaxFormSelectionDetails = {
    taxForms: TaxForm[];
    selectedTaxForms: TaxForm[];
    selectedYears: { [key: string]: string };
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

export enum DisplayName {
    TaxForms = 'TAX Forms',
}
