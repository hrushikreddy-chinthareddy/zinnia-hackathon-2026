import { TFunction } from 'next-i18next';

import { AmountType, PartyRoles, ProgramType } from '@deps/models/case/withdrawal/case';

import { EditableFormProgramFields } from '../form-program/form-program.helpers';

export type SSWFormProgramFields = Omit<EditableFormProgramFields, 'withdrawType'>;
export const getDefaultSSWFormProgramValues = (): SSWFormProgramFields => {
    return {
        programAmount: { text: null, amountType: AmountType.Dollar },
        gmwbAmount: { text: null, amountType: AmountType.Dollar },
        partialAmount: { text: null, amountType: AmountType.Dollar },
        partialGrossAmount: { text: null, amountType: AmountType.Dollar },
        partialNetAmount: { text: null, amountType: AmountType.Dollar },
        partialPercent: { text: null, amountType: AmountType.Percent },
        program: { text: 'Systematic Withdrawal' },
        programSubType: { text: null },
        programType: { text: ProgramType.SSW },
    };
};

const createCoveredLifeInitialValue = (partyRoleType: PartyRoles) => ({
    partyRoleType,
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: null,
    fullName: '',
    taxId: '',
    maritalStatus: {},
    email: '',
    employer: null,
    relationshipToOwnerAnnutant: null,
    withdrawalPayoutOption: null,
    addresses: null,
    phones: [],
    dob: {
        value: '',
        text: '',
        isValid: true,
    },
});

export const getCoveredLifeInitialValues = () => [
    createCoveredLifeInitialValue(PartyRoles.GLWB_FIRST_COVERED_PERSON),
    createCoveredLifeInitialValue(PartyRoles.GLWB_SEC_COVERED_PERSON),
];

export enum GlwbType {
    Static = 'STATIC',
    Dynamic = 'DYNAMIC',
}

export const glwbTypeOptions = (t: TFunction) => [
    { label: t('glwbType.static'), value: GlwbType.Static },
    { label: t('glwbType.dynamic'), value: GlwbType.Dynamic },
];
