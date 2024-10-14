import { FieldFormat } from '@deps/components/fields/field';

export const DefaultSidebarContent = {
    contractId: '',
    documentNumber: '',
    caseId: '',
    transactions: [],
};

export const numberFormat = { format: '################' };
export const amountFormat = { type: 'number' as FieldFormat, decimalPlaces: 2, format: '' };
export const FIVE_YEAR = '5YEAR';
export const TEN_YEAR = '10YEAR';
export const MAX_COMPARISON = 3;
export const LAST_COMPARISON = 2;
export const DEATH_BENEFITS = 'deathBenefit';
export const SURRENDER_BENEFITS = 'surrenderBenefit';
export const PHONE_NUMBER_FORMAT = { format: '##########' };
export const EXTENSION_FORMAT = { format: '#########' };
export const SSN_FORMAT = { format: '#########' };
