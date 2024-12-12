import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { SignPresent } from '@deps/models/case/renewal/signature-validation';

import { SignatureFieldNames, SignaturePresentProps } from './signature-parts';
import { SignatureValidationContext } from '../signature-validation-context';
import { getDefaultCoreSelectOptions } from './core/is-valid-core';

export default function SignatureCityProvided({ isFormStateReadOnly = false }: SignaturePresentProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.signatureValidation' });
    const { errors, isSignatureCityProvided, setIsSignatureCityProvided, signType } = useContext(SignatureValidationContext);
    const [signatureCityProvided, setSignatureCityProvided] = useState(
        isSignatureCityProvided?.text ? SignPresent.Yes : isSignatureCityProvided?.text === false ? SignPresent.No : SignPresent.Unselected
    );

    useEffect(() => {
        setIsSignatureCityProvided(
            signatureCityProvided === SignPresent.Unselected
            ? { text: null }
            : { text: signatureCityProvided === SignPresent.Yes}
        );
    }, [signatureCityProvided]);

    return (
        <SelectSimple
            data-testid={`${signType?.text}-signature-present`}
            label={t('signatureCityProvided') as string}
            message={errors[SignatureFieldNames.SignatureCityProvided]}
            onChange={val => setSignatureCityProvided(val as SignPresent)}
            options={getDefaultCoreSelectOptions(t)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signatureCityProvided as string}
            name={`${signType?.text}-signature-city-provided`}
            variant={errors[SignatureFieldNames.SignaturePresent] ? FieldVariant.Error : FieldVariant.Default}
            disabled={isFormStateReadOnly}
        />
    );
}
