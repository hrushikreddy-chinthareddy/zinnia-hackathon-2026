import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import SignatureTextCore from './core/signature-text-core';
import { SignatureDateProps, SignatureFieldNames } from './signature-parts';
import { selectVarientByConfig } from '../../form-party/form-party';
import { SignatureValidationContext } from '../signature-validation-context';

export default function SignaturePrintName({ isFormStateReadOnly = false }: SignatureDateProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.signatureValidation' });
    const { errors, signName, setSignName, signType } = useContext(SignatureValidationContext);

    return (
        <SignatureTextCore
            errors={errors}
            setSignatureText={value => setSignName(value)}
            text={signName || ''}
            signType={signType.text}
            fieldName={SignatureFieldNames.SignaturePrintName}
            label={t('printName') as string}
            testId={'signature-print-name'}
            variant={selectVarientByConfig({
                value: signName || '',
                isFormStateReadOnly,
                error: errors[SignatureFieldNames.SignaturePrintName],
            })}
            disabled={isFormStateReadOnly}
        ></SignatureTextCore>
    );
}
