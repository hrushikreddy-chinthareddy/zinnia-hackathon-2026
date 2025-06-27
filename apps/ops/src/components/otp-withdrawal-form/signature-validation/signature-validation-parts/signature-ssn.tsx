import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import Field, { FieldSize, FieldType } from '@deps/components/fields/field';

import { SignatureFieldNames, SignaturePartProps } from './signature-parts';
import { selectVarientByConfig } from '../../form-party/form-party';
import { SignatureValidationContext } from '../signature-validation-context';

export default function SignatureSsn({
    isFormStateReadOnly = false,
}: SignaturePartProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.signatureValidation',
    });
    const { errors, ssn, setSsn, signType } = useContext(
        SignatureValidationContext
    );

    return (
        <Field
            label={t('signatureSsn') as string}
            message={errors[SignatureFieldNames.SignatureSsn]}
            onChange={(e) => {
                setSsn({ text: e.target.value });
            }}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={ssn?.text || ''}
            variant={selectVarientByConfig({
                value: ssn?.text || '',
                isFormStateReadOnly,
                error: errors[SignatureFieldNames.SignatureSsn],
            })}
            data-testid={`${signType.text}-signature-ssn`}
            disabled={isFormStateReadOnly}
        />
    );
}
