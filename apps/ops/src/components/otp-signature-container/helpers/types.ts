import { SignatureValidationField } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation';
import { SignaturePartProps } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';

export type SignatureValidationContainerConfig = {
    bonusField?: React.FC<SignaturePartProps>;
    fields: SignatureValidationField[];
    key: string;
    shouldDisplay?: <T>(data?: T) => boolean;
    signatureType: SignatureValidationTypeWithdrawal;
};
