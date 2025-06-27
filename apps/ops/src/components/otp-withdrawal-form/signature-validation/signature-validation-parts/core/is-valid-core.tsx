import { TFunction } from 'next-i18next';
import { useEffect, useState } from 'react';

import {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import {
    SignValidated,
    SignatureValidationTypeWithdrawal,
} from '@deps/models/case/renewal/signature-validation';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { SignatureFieldNames, SignaturePartProps } from '../signature-parts';

export type SignatureIsValidCoreProps = {
    errors: FormValidationErrors;
    isSignatureValid?: boolean | null;
    signType: {
        text: SignatureValidationTypeWithdrawal | null;
    };
    setIsSignatureValid: React.Dispatch<
        React.SetStateAction<boolean | null | undefined>
    >;
    fieldName: SignatureFieldNames;
    signValidatedOptions: { label: string; value: SignValidated }[];
    label: string;
    testId: string;
    variant?: FieldVariant;
    disabled?: boolean;
} & SignaturePartProps;

export const getDefaultCoreSelectOptions = (t: TFunction) => [
    { label: t('selectOption'), value: SignValidated.Unselected },
    { label: t('yes'), value: SignValidated.Yes },
    { label: t('no'), value: SignValidated.No },
];

export default function SignatureIsValidCore({
    errors,
    isSignatureValid,
    setIsSignatureValid,
    signType,
    fieldName,
    label,
    testId,
    signValidatedOptions,
    shouldDisplay = true,
    variant = FieldVariant.Default,
    disabled = false,
}: SignatureIsValidCoreProps) {
    const [signValid, setSignValid] = useState(
        isSignatureValid
            ? SignValidated.Yes
            : isSignatureValid === false
            ? SignValidated.No
            : SignValidated.Unselected
    );

    useEffect(() => {
        if (signValid === SignValidated.Unselected) {
            setIsSignatureValid(null);
            return;
        }

        setIsSignatureValid(signValid === SignValidated.Yes);
    }, [signValid]);

    useEffect(() => {
        if (!shouldDisplay) {
            setIsSignatureValid(null);
        }
    }, [shouldDisplay]);

    if (!shouldDisplay) {
        return null;
    }

    return (
        <SelectSimple
            label={label}
            data-testid={`${signType?.text}-${testId}`}
            message={errors[fieldName]}
            onChange={(val) => setSignValid(val as SignValidated)}
            options={signValidatedOptions}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signValid as string}
            variant={variant}
            disabled={disabled}
        />
    );
}
