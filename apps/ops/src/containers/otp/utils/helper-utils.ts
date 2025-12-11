import { TFunction } from 'i18next';

import { BankingFields } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { ProcessType } from '@deps/models/case/enums';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
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

export const createDtccValidator = (t: TFunction, processType: ProcessType) => {
    const errors = {} as FormValidationErrors;

    return (
        operation: SupportedValidationOperation,
        currentValue: string,
        allValues: any
    ) => {
        if (operation === SupportedValidationOperation.Equal) {
            const contractNumber = currentValue;

            // Use switch for contract number required error logic
            switch (processType) {
                case ProcessType.OFT: {
                    const participantId = allValues?.participantId;

                    // If participantId is '0000' and contractNumber is '0000', return error
                    if (participantId === '0000' && contractNumber === '0000') {
                        return (errors[BankingFields.ContractNumber] = t(
                            'formValidation.participantIdCannotBeSubmitted'
                        ));
                    }
                    // Only show contract number required error if participantId is not empty string
                    if (participantId && contractNumber === '') {
                        return (errors[BankingFields.ContractNumber] = t(
                            'formValidation.contractNumberRequired'
                        ));
                    }
                    break;
                }
                case ProcessType.WITHDRAWAL: {
                    const dtccParticipantId = allValues?.participantId?.text;

                    // If participantId is '0000' and contractNumber is '0000', return error
                    if (
                        dtccParticipantId === '0000' &&
                        contractNumber === '0000'
                    ) {
                        return (errors[BankingFields.ContractNumber] = t(
                            'formValidation.participantIdCannotBeSubmitted'
                        ));
                    }
                    // Only show contract number required error if participantId is not empty string
                    if (
                        dtccParticipantId &&
                        dtccParticipantId?.text !== null &&
                        contractNumber === ''
                    ) {
                        return (errors[BankingFields.ContractNumber] = t(
                            'formValidation.contractNumberRequired'
                        ));
                    }
                    break;
                }
            }
        }
        return '';
    };
};
