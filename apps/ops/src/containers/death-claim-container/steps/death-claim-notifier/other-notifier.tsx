import { useEffect, useState } from "react";

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import FaxNumber from '@deps/components/otp-send-document/components/fax-field';
import AddressEntry from '@deps/components/otp-withdrawal-form/address-entry';
import { IFieldConfig, selectVarientByConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import SelectSimple from '@deps/components/select/select';
import { Address, FormValidationErrors } from "@deps/models/case/withdrawal/case";

export enum ClaimFields {
    FirstName = 'firstName',
    MiddleName = 'middleName',
    LastName = 'lastName',
    TaxId = 'taxId',
    Dob = 'dob',
    Email = 'email',
    Address = 'address',
    Fax = 'fax',
    Suffix = 'suffix',
    RelationShipToDeceased = "relationshipToDeceased"
};

type option = { label: string, value: string };

export type FieldConfig = {
    fieldName: ClaimFields;
    fieldLabel: string;
    fieldOption?: option[],
    placeHolder?: string
};

export function useFields(formErrors?: FormValidationErrors) {
    const ssnFormat = { format: '#########' };

    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState({} as Address);
    const [fax, setfax] = useState('');
    const [suffix, setSuffix] = useState('');
    const [relationship, setRelationship] = useState('');

    const [currentParty, setCurrentParty] = useState({
        firstName,
        middleName,
        lastName,
        suffix,
        relationshipToInsured:relationship
    });

    useEffect(() => {
        setCurrentParty({
            firstName,
            middleName,
            lastName,
            suffix,
            relationshipToInsured: relationship
        });
    }, [firstName, middleName, lastName, relationship, suffix]);

  //const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'deathClaims.deceasedDetails.labels.otherNotifier' });

    const firstNameField = ({ label }: IFieldConfig) => (
        <Field
            label={label}
            message={formErrors?.firstName}
            onChange={e => { setFirstName(e.target.value) }}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={firstName}
            maxLength={15}
            variant={selectVarientByConfig({ value: firstName })}
        />
    );

    const middleNameField = ({ label }: IFieldConfig) => (
        <Field
            label={label}
            message={formErrors?.middleName}
            onChange={e => setMiddleName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={middleName}
            maxLength={15}
            variant={selectVarientByConfig({ value: middleName })}
        />
    );

    const lastNameField = ({ label }: IFieldConfig) => (
        <Field
            label={label}
            message={formErrors?.lastName}
            onChange={e => setLastName(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={lastName}
            maxLength={40}
            variant={selectVarientByConfig({ value: lastName })}
        />
    );

    const dobField = ({ label }: IFieldConfig) => (
        <FieldDateSelect
            label={label}
            onChange={e => setDob(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={dob}
            variant={FieldVariant.Default}
        />
    );

    const taxIdField = ({ label }: IFieldConfig) => (
        <Field
            className="max-w-lg"
            formatOptions={ssnFormat}
            label={label}
            onChange={e => setTaxId(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={taxId}
            variant={selectVarientByConfig({ value: taxId })}
        />
    );

    const emailField = ({ label }: IFieldConfig) => (
        <Field
            label={label}
            onChange={e => setEmail(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={email}
            variant={selectVarientByConfig({ value: email })}
        />
    );

    const addressField = () => (
        <AddressEntry
            onDataChange={(val) =>
                setAddress(val as Address)
            }
            showAddressLines={true}
            initialAddress={address}
            className="col-span-4 max-w-lg"
        />
    );

    const faxField = () => (
        <FaxNumber fax={fax} setFax={setfax} />
    );

    const suffixField = ({ label }: IFieldConfig) => (
        <Field
            label={label}
            message={formErrors?.suffix}
            onChange={e => setSuffix(e.target.value)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={suffix}
            maxLength={4}
            variant={selectVarientByConfig({ value: suffix })}
        />
    );

    const relationshipToDeceased = ({ label, options, placeHolder }: { label: string, options: option[] | undefined, placeHolder: string }) => (
        <SelectSimple
            label={label}
            options={options ?? []}
            placeholder={placeHolder}
            onChange={(val: string) => { setRelationship(val) }}
            size={FieldSize.Small}
            value={relationship}
            message={formErrors?.relationship}
            variant={selectVarientByConfig({ value: relationship })}
        />
    );

    const renderField = (field: FieldConfig): JSX.Element | null => {
        switch (field.fieldName) {
        case ClaimFields.FirstName:
            return <div key={field.fieldName}>{firstNameField({ label: field.fieldLabel })}</div>;
        case ClaimFields.MiddleName:
            return <div key={field.fieldName}>{middleNameField({ label: field.fieldLabel })}</div>;
        case ClaimFields.LastName:
            return <div key={field.fieldName}>{lastNameField({ label: field.fieldLabel })}</div>;
        case ClaimFields.Dob:
            return <div key={field.fieldName}>{dobField({ label: field.fieldLabel })}</div>;
        case ClaimFields.Suffix:
            return <div key={field.fieldName}>{suffixField({ label: field.fieldLabel })}</div>;
        case ClaimFields.TaxId:
            return <div key={field.fieldName}>{taxIdField({ label: field.fieldLabel })}</div>;
        case ClaimFields.Email:
            return <div key={field.fieldName}>{emailField({ label: field.fieldLabel })}</div>;
        case ClaimFields.Address:
            return <div key={field.fieldName}>{addressField()}</div>;
        case ClaimFields.Fax:
            return <div key={field.fieldName}>{faxField()}</div>;
        case ClaimFields.RelationShipToDeceased:
            return <div key={field.fieldName}>{relationshipToDeceased({ label: field.fieldLabel, options: field.fieldOption, placeHolder: field.placeHolder ?? '' })}</div>;
        default:
            return null;
        }
    };

    return {
        renderField,
        currentParty
    };
}

function OtherNotifier({ fields, onDataChange, formErrors }: { fields: FieldConfig[], onDataChange: (value: any)  => void , formErrors?: FormValidationErrors}) {
    const { renderField , currentParty} = useFields(formErrors);

    useEffect(() => {
        onDataChange({
            ...currentParty,
            partyRole: undefined,
            partyRoleId: undefined,
            partyType: undefined,
            partyId: '',
            prefix: '',
            fullName: '',
            gender: '',
            dateOfBirth: '',
        });
    }, [currentParty]);

    return (
        <div className="my-4 grid w-full grid-cols-4 gap-2">
            {fields?.map((field) => renderField(field))}
        </div>
    )
}

export default OtherNotifier;