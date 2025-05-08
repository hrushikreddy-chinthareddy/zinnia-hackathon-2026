import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { IFieldConfig, selectVarientByConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { PartyFields } from '@deps/components/otp-withdrawal-form/form-party/party-helpers';
import { OwnerInformation } from '@deps/models/case/task';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

interface PartyFieldConfig {
    fieldName: PartyFields;
    fieldLabel: string;
}

export function usePartyFields(party: OwnerInformation, formErrors?: FormValidationErrors) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

    const [firstName, setFirstName] = useState(party?.firstName || '');
    const [middleName, setMiddleName] = useState(party?.middleName || '');
    const [lastName, setLastName] = useState(party?.lastName || '');

    const [currentParty, setCurrentParty] = useState(party);

    useEffect(() => {
        setCurrentParty({
            ...party,
            firstName,
            middleName,
            lastName,
        });
    }, [firstName, middleName, lastName]);

    const firstNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            label={label || (t(`firstName`) as string)}
            message={formErrors?.name}
            onChange={e => setFirstName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={firstName}
            variant={selectVarientByConfig({ value: firstName, isFormStateReadOnly, error: formErrors?.name })}
        />
    );

    const middleNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            className={formErrors?.name && 'border-2 border-solid border-semantic-error'}
            label={label || (t(`middleName`) as string)}
            onChange={e => setMiddleName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={middleName}
            variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
        />
    );

    const lastNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            className={formErrors?.name && 'border-2 border-solid border-semantic-error'}
            label={label || (t(`lastName`) as string)}
            onChange={e => setLastName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={lastName}
            variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
        />
    );

    const renderField = (field: PartyFieldConfig, isFormStateReadOnly: boolean): JSX.Element | null => {
        switch (field.fieldName) {
            case PartyFields.FirstName:
                return <div key={field.fieldName}>{firstNameField({ label: field.fieldLabel, isFormStateReadOnly })}</div>;
            case PartyFields.MiddleName:
                return <div key={field.fieldName}>{middleNameField({ label: field.fieldLabel, isFormStateReadOnly })}</div>;
            case PartyFields.LastName:
                return <div key={field.fieldName}>{lastNameField({ label: field.fieldLabel, isFormStateReadOnly })}</div>;

            default:
                return null;
        }
    };

    return { renderField, currentParty };
}

interface SinglePartyProps {
    fields: PartyFieldConfig[];
    formParty: AdditionalOwnerInformation;
    formErrors: FormValidationErrors;
    onDataChange: (value: OwnerInformation) => void;
    isFormStateReadOnly: boolean;
}

export interface AdditionalOwnerInformation extends OwnerInformation {
    id?: number;
}

export function SingleOwner({ fields, formErrors, formParty, isFormStateReadOnly, onDataChange }: SinglePartyProps) {
    const { renderField, currentParty } = usePartyFields(formParty, formErrors);

    useEffect(() => {
        onDataChange(currentParty);
    }, [currentParty]);

    return <div className="my-2 grid grid-cols-3 gap-4">{fields?.map(field => renderField(field, isFormStateReadOnly))}</div>;
}
