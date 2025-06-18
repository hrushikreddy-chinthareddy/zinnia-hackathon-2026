import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

export enum DisclosureAuthorizationFields {
    SignatureDate = 'signatureDate',
    ExpectedAcctValue = 'expectedAcctValue',
    Product = 'product',
    CdscPeriod = 'cdscPeriod',
}

export interface DisclosureAuthorizationFieldConfig {
    fieldName: DisclosureAuthorizationFields;
    fieldLabel: string;
}

export interface DisclosureAuthorizationInformation {
    signatureDate: string;
    expectedAcctValue: string | number;
    product: string;
    cdscPeriod: string;
}

export enum Products {
    'stableVoyage' = 'STABLE_VOYAGE',
    'retireEase' = 'RETIRE_EASE',
    'retireEaseChoice' = 'RETIRE_EASE_CHOICE',
    'stableVoyagePlus' = 'STABLE_VOYAGE_PLUS',
}

export enum CDSCPeriods {
    'NA' = 'N/A',
    '1YearGuarantee' = '1YEAR_GUARANTEE',
    '3YearGuarantee' = '3YEAR_GUARANTEE',
    '4YearGuarantee' = '4YEAR_GUARANTEE',
    '5YearGuarantee' = '5YEAR_GUARANTEE',
    '7YearGuarantee' = '7YEAR_GUARANTEE',
    '9YearGuarantee' = '9YEAR_GUARANTEE',
}

export interface FormDisclosureAuthorization {
    disclosureAuthorization: DisclosureAuthorizationInformation;
}

export interface DisclosureAuthorizationConfig {
    title: string;
    fields: {
        fieldName: DisclosureAuthorizationFields;
        fieldLabel: string;
    }[];
}

export interface DisclosureAuthorizationFormProps {
    configs: DisclosureAuthorizationConfig;
    formDisclosureAuthorization: DisclosureAuthorizationInformation;
    setFormDisclosureAuthorization: React.Dispatch<React.SetStateAction<DisclosureAuthorizationInformation>>;
    formErrors: FormValidationErrors;
    isFormStateReadOnly?: boolean;
    planCode: string;
}

export interface DisclosureAuthorizationProps {
    fields: DisclosureAuthorizationFieldConfig[];
    disclosureAuthorizationInfo: DisclosureAuthorizationInformation;
    formErrors: FormValidationErrors;
    onDataChange: (value: DisclosureAuthorizationInformation) => void;
    isFormStateReadOnly?: boolean;
    planCode: string;
}
