import {
    DisbursementParts,
    SupportedValidationOperation,
} from '@deps/models/case/withdrawal/disbursement-types';

type ValidatorFunction = (
    operation: SupportedValidationOperation,
    currentValue: string,
    allValues: DisbursementParts
) => string;

export const createValidator = (
    fieldName: keyof DisbursementParts,
    errorMessage: string
): ValidatorFunction => {
    return (
        operation: SupportedValidationOperation,
        currentValue: string,
        allValues: DisbursementParts
    ) => {
        if (operation === SupportedValidationOperation.Equal) {
            if (currentValue && currentValue !== allValues[fieldName]) {
                return errorMessage;
            }
        }
        return '';
    };
};
