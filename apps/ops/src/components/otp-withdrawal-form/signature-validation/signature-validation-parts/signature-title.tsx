import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { SignatureDesignation } from '@deps/models/case/renewal/signature-validation';

import { SignatureFieldNames, SignatureTitleProps } from './signature-parts';
import { SignatureValidationContext } from '../signature-validation-context';

export default function SignatureTitle({ isFormStateReadOnly = false }: SignatureTitleProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.signatureValidation' });
    const { errors, signTitle, setSignTitle, signType } = useContext(SignatureValidationContext);

    const signatureDesignationOptions = [
        { label: t('selectOption'), value: SignatureDesignation.Unselected },
        { label: t('trustee'), value: SignatureDesignation.Trustee },
        { label: t('executor'), value: SignatureDesignation.Executor },
        { label: t('custodian'), value: SignatureDesignation.Custodian },
        { label: t('guardian'), value: SignatureDesignation.Guardian },
        { label: t('attorneyInFact'), value: SignatureDesignation.AttorneyInFact },
        { label: t('assignee'), value: SignatureDesignation.Assignee },
        { label: t('na'), value: SignatureDesignation.NA },
    ];

    return (
        <SelectSimple
            label={t('designation') as string}
            message={errors[SignatureFieldNames.SignatureTitle]}
            onChange={val => setSignTitle({ text: val === SignatureDesignation.Unselected ? null : val })}
            options={signatureDesignationOptions}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signTitle?.text || (SignatureDesignation.Unselected as string)}
            variant={errors[SignatureFieldNames.SignatureTitle] ? FieldVariant.Error : FieldVariant.Default}
            data-testid={`${signType?.text}-signature-designation`}
            disabled={isFormStateReadOnly}
        />
    );
}
