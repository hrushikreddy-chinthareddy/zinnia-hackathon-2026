import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';

import { SignatureTypeProps } from './signature-parts';
import { SignatureValidationContext } from '../signature-validation-context';

export default function SignatureType({
    isFormStateReadOnly = false,
}: SignatureTypeProps) {
    const { signType } = useContext(SignatureValidationContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.signatureValidation',
    });
    return (
        <Field
            label={t('type') as string}
            onChange={() => undefined}
            size={FieldSize.Small}
            value={signType.text || ''}
            variant={FieldVariant.Inactive}
            type={FieldType.BaseActive}
            data-testid={`${signType.text}-type`}
            disabled={isFormStateReadOnly}
            isReadOnly
        />
    );
}
