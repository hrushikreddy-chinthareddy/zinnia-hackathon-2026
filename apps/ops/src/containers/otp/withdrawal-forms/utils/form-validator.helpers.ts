import { TFunction } from 'next-i18next';

import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import { BankingFields } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import { SignatureFieldNames } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    FormSignature,
    FormValidationErrors,
    QCD,
} from '@deps/models/case/withdrawal/case';

/**
 * DTCC placeholder participant ID that represents "no valid participant selected".
 * This value cannot be submitted to the DTCC system when used in combination
 * with a placeholder contract number.
 */
export const DTCC_INVALID_PARTICIPANT_ID = '0000';

interface ValidateSignESignParams {
    formSignature: FormSignature | undefined;
    formESignatureData: FormEsignatureData | null | undefined;
    t: TFunction;
    validateDesignationPresent?: boolean;
    validateComment?: boolean;
    validateCityProvided?: boolean;
    validateAnnuitant?: boolean;
}

// Signature and e-signature validation for withdrawal forms
export const validateSignESign = ({
    formSignature,
    formESignatureData,
    t,
    validateDesignationPresent = false,
    validateComment = false,
    validateCityProvided = false,
    validateAnnuitant = false,
}: ValidateSignESignParams): FormValidationErrors => {
    const errors = {} as FormValidationErrors;
    const ownerSignature = formSignature?.signatures?.find(
        (sigInfo) =>
            sigInfo?.signType?.text === SignatureValidationTypeWithdrawal.Owner
    );

    const annuitantSignature = formSignature?.signatures?.find(
        (sigInfo) =>
            sigInfo?.signType?.text ===
            SignatureValidationTypeWithdrawal.Annuitant
    );

    const ownerESignature = formESignatureData?.eSignatures?.find(
        (sigInfo) =>
            sigInfo?.signType?.text === SignatureValidationTypeWithdrawal.Owner
    );
    // validate owner Signature
    if (ownerSignature) {
        // No signature present and e-signature present unselected
        if (
            ownerSignature?.isSigned !== false &&
            !ownerSignature?.isSigned &&
            !formESignatureData?.isFormESignaturePresent
        ) {
            errors[
                `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignaturePresent}`
            ] = t('formValidation.signaturePresentOptionMustBeSelected');
        }

        // only where designation is present in helper file
        if (
            validateDesignationPresent &&
            ownerSignature?.isDesignationPresent === null &&
            !formESignatureData?.isFormESignaturePresent
        ) {
            errors[
                `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignatureDesignation}`
            ] = t('formValidation.signatureDesignationMustBeSelected');
        }
        // No signature comment added

        if (
            validateComment &&
            ownerSignature?.isSignatureValid &&
            !ownerSignature?.signatureComment
        ) {
            errors[
                `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignatureComment}`
            ] = t('formValidation.signatureCommentMustBePresent');
        }

        if (
            validateCityProvided &&
            ownerSignature?.isSignatureCityProvided?.text === null
        ) {
            errors[
                `${SignatureValidationTypeWithdrawal.Owner}${SignatureFieldNames.SignatureCityProvided}`
            ] = t('formValidation.signatureCityOptionMustBeSelected');
        }
    }
    // validate owner e-Signature
    if (formESignatureData?.isFormESignaturePresent) {
        if (ownerESignature?.isSigned === null) {
            errors[
                `${SignatureValidationTypeWithdrawal.Owner}-e-signature-present`
            ] = t('formValidation.signaturePresentOptionMustBeSelected');
        }
    }

    // validate annutant Signatuere
    if (validateAnnuitant && annuitantSignature) {
        if (
            annuitantSignature?.isSigned !== false &&
            !annuitantSignature?.isSigned &&
            !formESignatureData?.isFormESignaturePresent
        ) {
            errors[
                `${SignatureValidationTypeWithdrawal.Annuitant}${SignatureFieldNames.SignaturePresent}`
            ] = t('formValidation.signaturePresentOptionMustBeSelected');
        }
    }

    return errors;
};

export const validateCharityName = (
    t: TFunction,
    qcdDetails: QCD[]
): FormValidationErrors => {
    const errors = {} as FormValidationErrors;
    // Push errors for charityName at specific index
    qcdDetails?.forEach((qcd, id) => {
        if (!qcd?.charityName || qcd?.charityName.trim() === '') {
            errors[`charityName_${id}`] = t(
                'formValidation.charityNameRequired'
            );
        }
    });

    return errors;
};

export const validateDtccDetails = (
    t: TFunction,
    participantId: string = '',
    contractNumber: string = ''
): FormValidationErrors => {
    const errors = {} as FormValidationErrors;
    if (
        participantId === DTCC_INVALID_PARTICIPANT_ID &&
        contractNumber === DTCC_INVALID_PARTICIPANT_ID
    ) {
        errors[BankingFields.ContractNumber] = t(
            'formValidation.participantIdCannotBeSubmitted'
        );
    } else if (participantId && contractNumber === '') {
        errors[BankingFields.ContractNumber] = t(
            'formValidation.contractNumberRequired'
        );
    }
    return errors;
};

export const validateQcdDetails = (
    t: TFunction,
    qcdDetails: QCD[]
): FormValidationErrors => {
    let qcdErrors = {} as FormValidationErrors;

    const charityNameValidation = validateCharityName(t, qcdDetails);

    const qcdValidation = Object.keys(charityNameValidation).map((key) => ({
        [key]: charityNameValidation[key],
    }));

    // Merge all error objects into one
    qcdErrors = Object.assign({}, ...qcdValidation);

    return qcdErrors;
};
