import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { ApplyChargesType } from '../applied-charges/applied-charges-types';
import { AnnuityQuote } from '../proposed-annuity-quote/proposed-annuity-quote.types';

export interface ContractComparisonTableConfig {
    title: string;
    key: BenefitType;
    rowConfig: Benefit[];
    colConfigFixed: ContractComparisonTableColumn[];
    colConfigVariable: ContractComparisonTableColumn[];
}

interface ContractComparisonTableColumn {
    headerName: string;
    field: string;
    editable: boolean;
    cellClass?: string[];
    valueParser?: (value: any) => any;
    valueFormatter?: (value: any) => any;
}

export interface ContractComparisonConfig {
    title: string;
    field: any;
    table: ContractComparisonTableConfig[];
}

export interface ContractComparisonReg60FormProps {
    configs: ContractComparisonConfig;
}

export enum ComparisonType {
    VARIABLE_TO_FIXED = 'VARIABLE_TO_FIXED',
    VARIABLE_TO_IMMEDIATE = 'VARIABLE_TO_IMMEDIATE',
    FIXED_TO_FIXED = 'FIXED_TO_FIXED',
    FIXED_TO_IMMEDIATE = 'FIXED_TO_IMMEDIATE',
    LIFE_TO_FIXED = 'LIFE_TO_FIXED',
    LIFE_TO_IMMEDIATE = 'LIFE_TO_IMMEDIATE',
}

export enum ContractComparisonField {
    comparisonType = 'comparisonType',
    partialRequest = 'partialRequest',
    goodFaithEstimateRequired = 'goodFaithEstimateRequired',
    companyName = 'companyName',
    companyPhoneNumber = 'companyPhoneNumber',
    contractNumber = 'contractNumber',
    issueDate = 'issueDate',
    accountValue = 'accountValue',
    surrenderChargeApplies = 'surrenderChargeApplies',
    mvaApplies = 'mvaApplies',
    mvaAmount = 'mvaAmount',
    surrenderValue = 'surrenderValue',
    annuitizationValueReceived = 'annuitizationValueReceived',
}

export interface CarrierBenefits {
    surrenderBenefit: Benefit[];
    deathBenefit: Benefit[];
}

export enum BenefitType {
    SurrenderBenefit = 'surrenderBenefit',
    DeathBenefit = 'deathBenefit',
}

export interface Benefit {
    period: string;
    returnGuarRate: number | string;
    returnCurrRate: number | string;
    return0Prct: number | string;
    return6Prct: number | string;
    return12Prct: number | string;
}

export type Disclosure = {
    proposedAnnuitizationQuote: AnnuityQuote;
    contractComparison: ContractComparison[];
};

export interface ContractComparison {
    comparisonId: number;
    comparisonType: string;
    partialRequest: boolean;
    goodFaithEstimateRequired: boolean;
    companyName: string;
    companyPhoneNumber: string;
    contractNumber: string;
    issueDate: string;
    accountValue: string | number;
    surrenderCharge: ApplyChargesType;
    mvaAmount: ApplyChargesType;
    surrenderValue: string | number;
    carrierBenefits: CarrierBenefits;
    annuitizationValueReceived: boolean;
    annuitizationQuote: null | any;
}

export interface ComparisonFormField {
    fieldName: ContractComparisonField;
    fieldLabel: string;
}

//to update
export interface CreateDisclosureProps {
    disclosure: Disclosure;
    onDisclosureChange: React.Dispatch<React.SetStateAction<Disclosure>>;
    formConfig: ContractComparisonConfig;
}

export interface ComparisonContractProps {
    comparisonContract: ContractComparison;
    title: string;
    formErrors?: FormValidationErrors;
    onComparisonContractChange: (data: ContractComparison) => void;
    formConfigs: ContractComparisonConfig;
}
