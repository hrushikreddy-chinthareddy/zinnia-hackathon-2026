import { TaxformResponse } from '@zinnia/api-types/types/documents-v3';

export type TaxForm = {
    contractNumber: string;
    name: string;
    fChar: string;
    formId: string;
    taxYear: string;
};
export const ALLOWED_TAX_YEARS = 5;
export type TaxFormSelectionDetails = {
    taxForms: TaxForm[] | TaxformResponse[];
    selectedTaxForms: TaxForm[] | TaxformResponse[];
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
