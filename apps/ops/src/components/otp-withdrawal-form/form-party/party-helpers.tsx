import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';

import ButtonGrp from '@deps/components/button-group/button-group';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import {
    FormValidationErrors,
    MaritalStatus,
    maritalStatusType,
    Party,
    PartyRoles,
} from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { PartyType } from '@zinnia/api-types/types/sor';

import { IFieldConfig, selectVarientByConfig } from './form-party';

export enum PartyFields {
    FirstName = 'firstName',
    MiddleName = 'middleName',
    LastName = 'lastName',
    TaxId = 'taxId',
    Dob = 'dob',
    Email = 'email',
    MaritalStatus = 'maritalStatus',
}

interface PartyFieldConfig {
    fieldName: PartyFields;
    fieldLabel: string;
}

export function usePartyFields(
    party: Party,
    formErrors?: FormValidationErrors
) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.personalDetails',
    });
    const ssnFormat = { format: '#########' };

    const formDob = party?.dob?.text
        ? dayjs(party?.dob?.text, ZAHARA_API_DATE_FORMAT).format(
              DATE_PICKER_FORMAT
          )
        : '';

    const [firstName, setFirstName] = useState(party?.firstName || '');
    const [middleName, setMiddleName] = useState(party?.middleName || '');
    const [lastName, setLastName] = useState(party?.lastName || '');
    const [taxId, setTaxId] = useState(party?.taxId || '');
    const [email, setEmail] = useState(party?.email || '');
    const [dob, setDob] = useState(formDob || '');
    const [maritalStatus, setMaritalStatus] = useState(
        party?.maritalStatus?.text || ''
    );
    const [currentParty, setCurrentParty] = useState(party);

    useEffect(() => {
        setCurrentParty({
            ...party,
            firstName,
            middleName,
            lastName,
            taxId,
            email,
            dob: dob
                ? {
                      text:
                          dob &&
                          dayjs(dob, DATE_PICKER_FORMAT).format(
                              ZAHARA_API_DATE_FORMAT
                          ),
                  }
                : { text: null },
            maritalStatus: { text: maritalStatus as maritalStatusType },
        });
    }, [firstName, middleName, lastName, taxId, email, dob]);

    const maritalStatusRadioItems = [
        { label: t(`maritalStatus.single`), value: MaritalStatus.Single },
        { label: t(`maritalStatus.married`), value: MaritalStatus.Married },
        { label: t(`maritalStatus.widowed`), value: MaritalStatus.Widowed },
    ];

    const firstNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            label={label || (t(`firstName`) as string)}
            message={formErrors?.name}
            onChange={(e) => setFirstName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={firstName}
            variant={selectVarientByConfig({
                value: firstName,
                isFormStateReadOnly,
                error: formErrors?.name,
            })}
        />
    );

    const middleNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            className={
                formErrors?.name &&
                'border-2 border-solid border-semantic-error'
            }
            label={label || (t(`middleName`) as string)}
            onChange={(e) => setMiddleName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={middleName}
            variant={selectVarientByConfig({
                value: middleName,
                isFormStateReadOnly,
            })}
        />
    );

    const lastNameField = ({ label, isFormStateReadOnly }: IFieldConfig) => {
        return (
            <Field
                className={
                    formErrors?.name &&
                    'border-2 border-solid border-semantic-error'
                }
                label={label || (t(`lastName`) as string)}
                onChange={(e) => setLastName(e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={lastName}
                variant={selectVarientByConfig({
                    value: lastName,
                    isFormStateReadOnly,
                })}
            />
        );
    };

    const emailField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            className={
                formErrors?.email &&
                'border-2 border-solid border-semantic-error'
            }
            label={label || (t(`email`) as string)}
            onChange={(e) => setEmail(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={email}
            variant={selectVarientByConfig({
                value: email,
                isFormStateReadOnly,
                error: formErrors?.email,
            })}
        />
    );

    const maritalStatusField = ({ label }: IFieldConfig) => (
        <ButtonGrp
            activeValue={maritalStatus}
            groupLabel={label || t(`maritalStatus.title`)}
            toggle={setMaritalStatus}
            labels={maritalStatusRadioItems}
        />
    );

    const dobField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <FieldDateSelect
            className={
                formErrors?.dob && 'border-2 border-solid border-semantic-error'
            }
            label={label || (t(`dob`) as string)}
            onChange={(e) => setDob(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={dob}
            disabled={isFormStateReadOnly}
            variant={
                isFormStateReadOnly
                    ? FieldVariant.Inactive
                    : FieldVariant.Default
            }
        />
    );

    const taxIdField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            className="max-w-lg"
            formatOptions={ssnFormat}
            label={label || (t(`ssn`) as string)}
            message={formErrors?.ssn}
            onChange={(e) => setTaxId(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={taxId}
            variant={selectVarientByConfig({
                value: taxId,
                isFormStateReadOnly,
                error: formErrors?.ssn,
            })}
        />
    );

    const renderField = (
        field: PartyFieldConfig,
        isFormStateReadOnly?: boolean
    ): JSX.Element | null => {
        switch (field.fieldName) {
            case PartyFields.FirstName:
                return (
                    <div key={field.fieldName}>
                        {firstNameField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case PartyFields.MiddleName:
                return (
                    <div key={field.fieldName}>
                        {middleNameField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case PartyFields.LastName:
                return (
                    <div key={field.fieldName}>
                        {lastNameField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case PartyFields.Email:
                return (
                    <div key={field.fieldName}>
                        {emailField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case PartyFields.MaritalStatus:
                return (
                    <div key={field.fieldName}>
                        {maritalStatusField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case PartyFields.Dob:
                return (
                    <div key={field.fieldName}>
                        {dobField({
                            label:
                                party.partyType == PartyType.TRUST
                                    ? (t('trustDate') as string)
                                    : field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );
            case PartyFields.TaxId:
                return (
                    <div key={field.fieldName}>
                        {taxIdField({
                            label: field.fieldLabel,
                            isFormStateReadOnly,
                        })}
                    </div>
                );

            default:
                return null;
        }
    };

    return { renderField, currentParty };
}

export interface AdditionalPartyInformation extends Party {
    id?: number;
}
export const getDefaultInformation = (type: PartyRoles): Party => {
    return {
        partyRoleType: type,
        firstName: '',
        middleName: '',
        lastName: '',
        fullName: '',
        suffix: '',
        dob: { text: null },
        taxId: '',
        email: '',
        employer: '',
        maritalStatus: {
            text: null,
        },
        addresses: [],
        phones: [],
    };
};

interface SinglePartyProps {
    fields: PartyFieldConfig[];
    formParty: AdditionalPartyInformation;
    formErrors: FormValidationErrors;
    onDataChange: (value: Party) => void;
    isFormStateReadOnly?: boolean;
    partyType?: PartyType;
}

export function SingleParty({
    fields,
    formErrors,
    formParty,
    isFormStateReadOnly,
    onDataChange,
    partyType,
}: SinglePartyProps) {
    const { renderField, currentParty } = usePartyFields(formParty, formErrors);

    useEffect(() => {
        onDataChange(currentParty);
    }, [currentParty]);

    const individualFields = ['firstName', 'lastName', 'middleName'];

    return (
        <div className="my-4 grid w-full grid-cols-3 gap-2">
            {fields
                ?.filter((field) => {
                    if (
                        partyType &&
                        partyType !== PartyType.INDIVIDUAL &&
                        individualFields.includes(field.fieldName)
                    ) {
                        return false;
                    }
                    return true;
                })
                .map((field) => renderField(field, isFormStateReadOnly))}
        </div>
    );
}
