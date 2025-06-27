import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import Field, { FieldSize, FieldType } from '@deps/components/fields/field';

import { SignatureFieldNames, SignaturePartProps } from './signature-parts';
import { selectVarientByConfig } from '../../form-party/form-party';
import { SignatureValidationContext } from '../signature-validation-context';

export default function SignatureComment({
    shouldDisplay = true,
    isFormStateReadOnly = false,
    label = 'signatureComment',
}: SignaturePartProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.signatureValidation',
    });
    const { errors, signatureComment, setSignatureComment, signType } =
        useContext(SignatureValidationContext);

    useEffect(() => {
        if (!shouldDisplay) {
            setSignatureComment(undefined);
        }
    }, [shouldDisplay]);

    if (!shouldDisplay) {
        return null;
    }
    return (
        <Field
            label={t(label) as string}
            message={errors[SignatureFieldNames.SignatureComment]}
            onChange={(e) => {
                setSignatureComment(e.target.value);
            }}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signatureComment || ''}
            variant={selectVarientByConfig({
                value: signatureComment || '',
                isFormStateReadOnly,
                error: errors[SignatureFieldNames.SignatureComment],
            })}
            data-testid={`${signType.text}-signature-comment`}
            disabled={isFormStateReadOnly}
        />
    );
}
