import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { SignPresent } from '@deps/models/case/renewal/signature-validation';

import { SignatureFieldNames, SignaturePresentProps } from './signature-parts';
import { SignatureValidationContext } from '../signature-validation-context';

export default function SignaturePresent({ isFormStateReadOnly = false }: SignaturePresentProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.signatureValidation' });
    const { errors, isSigned, setIsSigned, signType } = useContext(SignatureValidationContext);
    const [signPresent, setSignPresent] = useState(
        isSigned ? SignPresent.Yes : isSigned === false ? SignPresent.No : SignPresent.Unselected
    );
    const signPresentOptions = [
        { label: t('selectOption'), value: SignPresent.Unselected },
        { label: t('yes'), value: SignPresent.Yes },
        { label: t('no'), value: SignPresent.No },
    ];

    useEffect(() => {
        setIsSigned(signPresent === SignPresent.Unselected ? null : signPresent === SignPresent.Yes);
    }, [signPresent]);

    return (
        <SelectSimple
            data-testid={`${signType?.text}-signature-present`}
            label={t('signPresent') as string}
            message={errors[SignatureFieldNames.SignaturePresent]}
            onChange={val => setSignPresent(val as SignPresent)}
            options={signPresentOptions}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signPresent as string}
            name={`${signType?.text}-signature-present`}
            variant={errors[SignatureFieldNames.SignaturePresent] ? FieldVariant.Error : FieldVariant.Default}
            disabled={isFormStateReadOnly}
        />
    );
}
