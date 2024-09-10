import { AmountType, ProgramType } from '@deps/models/case/withdrawal/case';

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
