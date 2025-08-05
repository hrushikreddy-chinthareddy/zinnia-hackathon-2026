import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { DesignationPresent } from '@deps/models/case/renewal/signature-validation';

import {
    SignatureDesignationProps,
    SignatureFieldNames,
} from './signature-parts';
import { SignatureValidationContext } from '../signature-validation-context';

const SignatureDesignation = ({
    isFormStateReadOnly = false,
}: SignatureDesignationProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.signatureValidation',
    });

    const { errors, signType, isDesignationPresent, setIsDesignationPresent } =
        useContext(SignatureValidationContext);

    const signPresentOptions = [
        { label: t('selectOption'), value: DesignationPresent.Unselected },
        { label: t('yes'), value: DesignationPresent.Yes },
        { label: t('no'), value: DesignationPresent.No },
    ];

    return (
        <SelectSimple
            data-testid={`${signType?.text}-designation-present`}
            label={t('signDesignation') as string}
            message={errors[SignatureFieldNames.SignatureDesignation]}
            onChange={(val) => setIsDesignationPresent(val)}
            options={signPresentOptions}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={isDesignationPresent as string}
            name={`${signType?.text}-designation-present`}
            variant={
                errors[SignatureFieldNames.SignaturePresent]
                    ? FieldVariant.Error
                    : FieldVariant.Default
            }
            disabled={isFormStateReadOnly}
        />
    );
};

export default SignatureDesignation;
