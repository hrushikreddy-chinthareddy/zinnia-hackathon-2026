import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import SignatureIsValidCore, {
    getDefaultCoreSelectOptions,
} from './core/is-valid-core';
import { SignatureFieldNames, SignaturePartProps } from './signature-parts';
import { SignatureValidationContext } from '../signature-validation-context';

export default function NotaryStampValid({
    isFormStateReadOnly = false,
    shouldDisplay = true,
}: SignaturePartProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.signatureValidation',
    });
    const { errors, isNotaryValid, setIsNotaryValid, signType } = useContext(
        SignatureValidationContext
    );

    return (
        <SignatureIsValidCore
            signType={signType}
            shouldDisplay={shouldDisplay}
            isSignatureValid={isNotaryValid}
            setIsSignatureValid={setIsNotaryValid}
            signValidatedOptions={getDefaultCoreSelectOptions(t)}
            testId={'is-notary-sign-valid'}
            label={t('isNotarySignValid') as string}
            fieldName={SignatureFieldNames.IsNotarySignatureValid}
            errors={errors}
            disabled={isFormStateReadOnly}
        />
    );
}
