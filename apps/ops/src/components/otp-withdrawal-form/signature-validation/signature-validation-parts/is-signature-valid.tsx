import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { FieldVariant } from '@deps/components/fields/field';

import SignatureIsValidCore, { getDefaultCoreSelectOptions } from './core/is-valid-core';
import { SignatureFieldNames, SignaturePartProps } from './signature-parts';
import { SignatureValidationContext } from '../signature-validation-context';


export default function SignatureValid({ shouldDisplay = true, isFormStateReadOnly = false }: SignaturePartProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.signatureValidation' });
    const { errors, isSignatureValid, setIsSignatureValid, signType } = useContext(SignatureValidationContext);

    return (
        <SignatureIsValidCore
            testId={'is-signature-valid'}
            label={t('isSignatureValid') as string}
            fieldName={SignatureFieldNames.IsSignatureValid}
            setIsSignatureValid={setIsSignatureValid}
            signValidatedOptions={getDefaultCoreSelectOptions(t)}
            errors={errors}
            signType={signType}
            shouldDisplay={shouldDisplay}
            isSignatureValid={isSignatureValid}
            variant={errors[SignatureFieldNames.IsSignatureValid] ? FieldVariant.Error : FieldVariant.Default}
            disabled={isFormStateReadOnly}
        />
    );
}
