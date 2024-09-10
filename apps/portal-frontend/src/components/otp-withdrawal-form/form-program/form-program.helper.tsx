import { AmountType, FormProgram } from '@deps/models/case/withdrawal/case';

// These are the fields that are being edited in the formProgram section of the UI.
export type EditableFormProgramFields = Pick<
    FormProgram,
    | 'gmwbAmount'
    | 'partialAmount'
    | 'partialGrossAmount'
    | 'partialNetAmount'
    | 'partialPercent'
    | 'program'
    | 'programSubType'
    | 'programType'
    | 'withdrawType'
    | 'programFrequency'
    | 'programAmount'
>;

// The values that can be impacted by user inputs, in their default forms.
export const getDefaultFormProgramValues = (): EditableFormProgramFields => {
    return {
        programAmount: { text: null, amountType: AmountType.Dollar }, // number or null
        gmwbAmount: { text: null, amountType: AmountType.Dollar }, // number or null
        partialAmount: { text: null, amountType: AmountType.Dollar }, // number or null
        partialGrossAmount: { text: null, amountType: AmountType.Dollar }, // number or null
        partialNetAmount: { text: null, amountType: AmountType.Dollar }, // number or null
        partialPercent: { text: null, amountType: AmountType.Percent }, // number or null
        program: { text: 'Withdrawal' }, // Always Withdrawal
        programSubType: { text: null }, // Total Free Withdrawal, null
        programType: { text: '' }, // Full Surrender, GMWB, Withdrawal, empty string
        withdrawType: { text: '' }, // GROSS, NET, empty string
    };
};
