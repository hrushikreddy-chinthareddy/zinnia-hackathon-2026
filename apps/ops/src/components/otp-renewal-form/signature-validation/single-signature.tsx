import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';
import xss from 'xss';

import Field, {
    FieldSize,
    FieldVariant,
    FieldType,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import {
    IFieldConfig,
    selectVarientByConfig,
} from '@deps/components/otp-withdrawal-form/form-party/form-party';
import SelectSimple from '@deps/components/select/select';
import {
    SignPresent,
    SignatureValidationType,
} from '@deps/models/case/renewal/signature-validation';
import { Signature } from '@deps/models/case/task';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import {
    NUMERIC_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';

export interface SignatureFieldConfig {
    fieldName: SignatureFields;
    fieldLabel?: string;
}

export enum SignatureFields {
    Name = 'name',
    SignatureDate = 'signatureDate',
    SignaturePresent = 'signaturePresent',
    SignatureType = 'signType',
    SignatureTitle = 'signTitle',
}

// set errors
export function useSignatureFields(
    signature: Signature,
    errors: FormValidationErrors
) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseRenewal.request',
    });
    const [signType, setSignType] = useState<SignatureValidationType>(
        signature?.type === 'Primary'
            ? SignatureValidationType.Owner
            : (signature?.type as SignatureValidationType)
    );
    const signDt = signature?.signDate
        ? dayjs(signature?.signDate, ZAHARA_API_DATE_FORMAT).format(
              NUMERIC_DATE_FORMAT
          )
        : '';
    const [signDate, setSignDate] = useState<string>(signDt || '');
    const [signPresent, setSignPresent] = useState<SignPresent>(
        (signature?.signaturePresent as SignPresent) || SignPresent.Unselected
    );
    const [name, setName] = useState<string>(signature?.name || ''); //get name from parent
    const [currentSignature, setCurrentSignature] = useState<Signature>(
        signature || ({} as Signature)
    );
    const [signTitle, setSignTitle] = useState<string>(signature?.title || '');

    useEffect(() => {
        setCurrentSignature({
            ...signature,
            name,
            isValidDate: signPresent == SignPresent.Yes,
            signDate:
                (signDate &&
                    dayjs(signDate, DATE_PICKER_FORMAT).format(
                        ZAHARA_API_DATE_FORMAT
                    )) ||
                null,
            signaturePresent: signPresent,
            title: signTitle,
        });
    }, [name, signDate, signPresent, signType, signTitle]);

    const signTypeOptions = [
        { label: t('owner'), value: SignatureValidationType.Owner },
        { label: t('employer'), value: SignatureValidationType.Employer },
        { label: t('trustee'), value: SignatureValidationType.Trustee },
        { label: t('planAdmin'), value: SignatureValidationType.PlanAdmin },
        { label: t('joint'), value: SignatureValidationType.Joint },
    ];

    const signPresentOptions = [
        { label: t('selectOption'), value: SignPresent.Unselected },
        { label: t('yes'), value: SignPresent.Yes },
        { label: t('no'), value: SignPresent.No },
    ];
    const signTypeField = ({ label }: IFieldConfig) => (
        <SelectSimple
            label={label || (t('type') as string)}
            onChange={(val) => setSignType(val as SignatureValidationType)}
            options={signTypeOptions}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signType || t('type')}
            disabled
        />
    );

    const nameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            label={label || (t('printedName') as string)}
            onChange={(e) => setName(xss(e.target.value))}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={name}
            variant={selectVarientByConfig({
                value: name,
                isFormStateReadOnly,
                error: errors[SignatureFields.Name],
            })}
        />
    );

    const signPresentField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <SelectSimple
            label={label || (t('signPresent') as string)}
            onChange={(val) => {
                setSignPresent(val as SignPresent);
            }}
            options={signPresentOptions}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signPresent as string}
            // message={errors[SignatureFields.SignaturePresent]}
            disabled={isFormStateReadOnly}
        />
    );

    const signDateField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <FieldDateSelect
            label={label || (t('caseRenewal.request.date') as string)}
            onChange={(e) => {
                setSignDate(e.target.value);
            }}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signDate}
            variant={selectVarientByConfig({
                value: signDate,
                isFormStateReadOnly,
                error: errors[SignatureFields.SignaturePresent],
            })}
            disabled={isFormStateReadOnly}
        />
    );

    const signTitleField = (isFormStateReadOnly: boolean) => (
        <Field
            label={t('title') as string}
            onChange={(e) => setSignTitle(xss(e.target.value))}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={signTitle}
            variant={
                isFormStateReadOnly
                    ? FieldVariant.Inactive
                    : FieldVariant.Default
            }
            disabled={isFormStateReadOnly}
        />
    );

    const renderField = (
        field: SignatureFieldConfig,
        isFormStateReadOnly: boolean
    ): JSX.Element | null => {
        switch (field.fieldName) {
            case SignatureFields.Name:
                return (
                    <div key={field.fieldName}>
                        {nameField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case SignatureFields.SignatureType:
                return (
                    <div key={field.fieldName}>
                        {signTypeField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case SignatureFields.SignaturePresent:
                return (
                    <div key={field.fieldName}>
                        {signPresentField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case SignatureFields.SignatureDate:
                return (
                    <div key={field.fieldName}>
                        {signDateField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case SignatureFields.SignatureTitle:
                return (
                    <div key={field.fieldName}>
                        {signTitleField(isFormStateReadOnly)}
                    </div>
                );

            default:
                return null;
        }
    };

    return { renderField, currentSignature };
}

interface SingleSignatureProps {
    fields: SignatureFieldConfig[];
    showTitle?: boolean;
    signature: AdditionalSignatureInfo;
    errors: FormValidationErrors;
    onDataChange: (value: Signature) => void;
    isFormStateReadOnly: boolean;
}

export interface AdditionalSignatureInfo extends Signature {
    id?: number;
}

export function SingleSignature({
    fields,
    showTitle = false,
    errors,
    signature,
    isFormStateReadOnly,
    onDataChange,
}: SingleSignatureProps) {
    const { renderField, currentSignature } = useSignatureFields(
        signature,
        errors
    );

    useEffect(() => {
        onDataChange(currentSignature);
    }, [currentSignature]);

    return (
        <>
            <div className="my-4 grid  grid-cols-4 gap-4">
                {fields?.map((field) =>
                    renderField(field, isFormStateReadOnly)
                )}
            </div>
            {showTitle && (
                <div className="my-4 w-1/3">
                    {renderField(
                        { fieldName: SignatureFields.SignatureTitle },
                        isFormStateReadOnly
                    )}
                </div>
            )}
        </>
    );
}
