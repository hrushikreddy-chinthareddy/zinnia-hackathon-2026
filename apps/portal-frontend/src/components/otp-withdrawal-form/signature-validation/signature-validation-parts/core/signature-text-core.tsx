import { useEffect, useState } from 'react';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { SignatureFieldNames } from '../signature-parts';

export type SignatureTextCoreProps = {
    errors: FormValidationErrors;
    text: string | null;
    signType: SignatureValidationTypeWithdrawal | null;
    setSignatureText: (date: string | null) => void;
    fieldName: SignatureFieldNames;
    label: string;
    testId: string;
    variant?: FieldVariant;
    disabled?: boolean;
};

export default function SignatureTextCore({
    errors,
    fieldName,
    testId,
    text,
    signType,
    label,
    disabled,
    setSignatureText,
    variant,
}: SignatureTextCoreProps) {
    const [signText, setSignText] = useState(text ?? '');

    useEffect(() => {
        setSignatureText(signText);
    }, [signText, setSignatureText]);

    return (
        <Field
            label={label}
            message={errors[fieldName]}
            data-testid={`${signType}-${testId}`}
            onChange={e => {
                setSignText(e.target.value);
            }}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signText}
            variant={variant}
            disabled={disabled}
        />
    );
}
