import CommissionExpireDate from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/commission-expire-date';
import NotaryStampValid from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/is-notary-stamp-valid';
import SignatureValid from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/is-signature-valid';
import SignatureComment from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-comment';
import SignatureDate from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-date';
import SignGuaranteeStamp from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-guarantee-stamp';
import SignaturePresent from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-present';
import SignatureSsn from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-ssn';
import SignatureTitle from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-title';
import SignatureType from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-type';
import SpousalConsent from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/spousal-consent';

import SignaturePrintName from './signature-print-name';

// Common interface for all signature-related properties
interface BaseSignatureProps {
    isFormStateReadOnly?: boolean;
}

// Specific props extending the base (optional)
export interface SignaturePartProps extends BaseSignatureProps {
    shouldDisplay?: boolean;
    label?: string;
}

export interface CommissionExpireDateProps extends BaseSignatureProps {} // No additional properties

// Reuse `BaseSignatureProps` for others if they only have `isFormStateReadOnly`
export interface SignatureDateProps extends BaseSignatureProps {}
export interface SignaturePresentProps extends BaseSignatureProps {}
export interface SignatureTitleProps extends BaseSignatureProps {}
export interface SignatureTypeProps extends BaseSignatureProps {}
export interface SignatureGuaranteeStampProps extends BaseSignatureProps {}

export enum SignatureFieldNames {
    IsSignatureValid = 'IsSignatureValid',
    IsNotarySignatureValid = 'IsNotarySignatureValid',
    CommissionExpireDate = 'CommissionExpireDate',
    SignatureComment = 'SignatureComment',
    SignatureDate = 'SignatureDate',
    SignaturePresent = 'SignaturePresent',
    SignatureTitle = 'SignatureTitle',
    SignatureType = 'SignatureType',
    SignatureGuaranteeStamp = 'SignatureGuaranteeStamp',
    SignatureSsn = 'SignatureSsn',
    SignaturePrintName = 'SignaturePrintName',
}

export const SignatureFields = {
    SignatureComment,
    SignatureDate,
    SignaturePresent,
    SignatureTitle,
    SignatureType,
    SignatureValid,
    NotaryStampValid,
    CommissionExpireDate,
    SignGuaranteeStamp,
    SignatureSsn,
    SignaturePrintName,
};

export const SignatureBonusFields = {
    SpousalConsent,
};
