import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { SignValidated } from '@deps/models/case/renewal/signature-validation';

import { getDefaultCoreSelectOptions } from './core/is-valid-core';
import { SignatureFieldNames, SignatureGuaranteeStampProps } from './signature-parts';
import { SignatureValidationContext } from '../signature-validation-context';

export default function SignGuaranteeStamp({ isFormStateReadOnly = false }: SignatureGuaranteeStampProps ) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.signatureValidation' });
    const { errors, signGuaranteeStamp, setSignGuaranteeStamp, signType } = useContext(SignatureValidationContext);

    const onChangeHandler = (value: string) => {
        setSignGuaranteeStamp({ text: value === SignValidated.Unselected ? null : value });
    };

    return (
        <SelectSimple
            label={t('signGuaranteeStamp') as string}
            className={'w-[500px]'}
            data-testid={`${signType?.text}-sign-guarantee-stamp`}
            message={errors[SignatureFieldNames.SignatureGuaranteeStamp]}
            onChange={onChangeHandler}
            options={getDefaultCoreSelectOptions(t)}
            size={FieldSize.Small}
            labelClassNames={'whitespace-nowrap'}
            type={FieldType.BaseActive}
            value={signGuaranteeStamp?.text ?? SignValidated.Unselected}
            variant={errors[SignatureFieldNames.SignatureGuaranteeStamp] ? FieldVariant.Error : FieldVariant.Default}
            disabled={isFormStateReadOnly}
        />
    );
}
