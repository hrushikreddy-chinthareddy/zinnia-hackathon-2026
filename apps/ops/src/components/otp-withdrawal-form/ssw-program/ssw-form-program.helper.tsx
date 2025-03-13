import { AmountType, PartyRoles, ProgramType } from '@deps/models/case/withdrawal/case';

import { EditableFormProgramFields } from '../form-program/form-program.helper';

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
    relationshipToOwnerAnnutant: '',
    withdrawalPayoutOption: '',
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
