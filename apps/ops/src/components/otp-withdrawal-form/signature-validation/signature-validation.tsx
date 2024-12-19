import { createElement, useEffect, useState } from 'react';

import { FormValidationErrors, SignatureWithdrawal } from '@deps/models/case/withdrawal/case';

import { SignatureValidationContext } from './signature-validation-context';
import { SignaturePartProps } from './signature-validation-parts/signature-parts';

export type SignatureValidationField = {
    component: React.FC<SignaturePartProps>;
    displayLogic?: (val: SignatureWithdrawal) => boolean | null;
    label?: string;
    key: string;
};

type SignatureValidationProps = {
    bonusField?: React.FC<SignaturePartProps>;
    className?: string;
    errors?: FormValidationErrors;
    fields: SignatureValidationField[];
    onDataChange: (val: SignatureWithdrawal) => void;
    sigProp: SignatureWithdrawal;
    isFormStateReadOnly?: boolean;
    preSelectedValues?: Pick<SignatureWithdrawal, 'ssn'>;
};

export default function SignatureValidation({
    bonusField,
    className = '',
    errors = {},
    fields,
    onDataChange,
    sigProp,
    isFormStateReadOnly,
    preSelectedValues,
}: SignatureValidationProps) {
    const [signature, setSignature] = useState(sigProp);
    const [isSignatureValid, setIsSignatureValid] = useState(signature.isSignatureValid);
    const [isSigned, setIsSigned] = useState(signature.isSigned);
    const [signName, setSignName] = useState(signature.signName);
    const [signatureComment, setSignatureComment] = useState(signature.signatureComment);
    const [signDate, setSignDate] = useState(signature.signDate);
    const [signTitle, setSignTitle] = useState(signature.signTitle);
    const [signType, setSignType] = useState(signature.signType);
    const [isNotaryValid, setIsNotaryValid] = useState(signature.isNotaryValid);
    const [commissionExpiryDate, setCommissionExpiryDate] = useState(signature.commissionExpiryDate);
    const [signGuaranteeStamp, setSignGuaranteeStamp] = useState(signature.signGuaranteeStamp);
    const [ssn, setSsn] = useState(signature.ssn || (preSelectedValues?.ssn && preSelectedValues.ssn));
    const [isSignatureCityProvided, setIsSignatureCityProvided] = useState(signature.isSignatureCityProvided);

    useEffect(() => {
        onDataChange(signature);
    }, [signature]);

    useEffect(() => {
        setSignature({
            ...signature,
            isSignatureValid,
            isSigned,
            signatureComment,
            signName,
            signDate,
            signTitle,
            signType,
            isNotaryValid,
            commissionExpiryDate,
            signGuaranteeStamp,
            ssn,
            isSignatureCityProvided
        });
    }, [
        isSignatureValid,
        isSigned,
        signName,
        signatureComment,
        signDate,
        signTitle,
        signType,
        isNotaryValid,
        commissionExpiryDate,
        signGuaranteeStamp,
        ssn,
        isSignatureCityProvided
    ]);

    const renderField = (field: SignatureValidationField, isFormStateReadOnly?: boolean) => {
        return createElement(field.component, {
            key: field.key,
            isFormStateReadOnly,
            label: field.label,
            shouldDisplay: field.displayLogic ? !!field.displayLogic(signature) : true,
        });
    };

    return (
        <SignatureValidationContext.Provider
            value={{
                ...signature,
                errors,
                isSignatureValid,
                isSigned,
                isNotaryValid,
                signGuaranteeStamp,
                setIsSignatureValid,
                setIsSigned,
                setIsNotaryValid,
                setSignatureComment,
                setSignDate,
                setCommissionExpiryDate,
                setSignGuaranteeStamp,
                setSignTitle,
                setSignType,
                setSsn,
                setIsSignatureCityProvided,
                signName,
                setSignName,
                signatureComment,
                signDate,
                commissionExpiryDate,
                signTitle,
                signType,
                ssn,
                isSignatureCityProvided
            }}
        >
            <div className={`grid grid-cols-${fields.length} gap-4 ${className}`}>
                {fields.map(field => renderField(field, isFormStateReadOnly))}
            </div>
            {bonusField && createElement(bonusField, { isFormStateReadOnly })}
        </SignatureValidationContext.Provider>
    );
}
