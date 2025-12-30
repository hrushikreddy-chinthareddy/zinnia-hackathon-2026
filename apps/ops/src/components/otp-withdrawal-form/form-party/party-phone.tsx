import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';

import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import { FormValidationErrors, Phone } from '@deps/models/case/withdrawal/case';

import { selectVarientByConfig, IFieldConfig } from './form-party';

export const DEFAULT_PHONE = {
    phoneCountry: null,
    phoneNumber: null,
    phoneTypeDesc: null,
    phoneType: {
        text: 'Owner_Phone_Day',
    },
};

export function usePhoneFields(
    phone: Phone,
    formErrors?: FormValidationErrors
) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.personalDetails',
    });
    const numberFormat = { format: '################' };
    const [phoneNumber, setphoneNumber] = useState(phone?.phoneNumber || '');
    const [currentPhone, setCurrentPhone] = useState(phone || DEFAULT_PHONE);

    useEffect(() => {
        setCurrentPhone({
            ...phone,
            phoneNumber,
        });
    }, [phoneNumber]);

    const phoneNumberField = ({ label, isFormStateReadOnly }: IFieldConfig) => (
        <Field
            label={label || (t(`daytimePhone`) as string)}
            onChange={(e) => setphoneNumber(e.target.value as string)}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={phoneNumber}
            formatOptions={numberFormat}
            message={formErrors?.phone}
            variant={selectVarientByConfig({
                value: phoneNumber,
                isFormStateReadOnly,
                error: formErrors?.phone,
            })}
        />
    );

    return { phoneNumberField, currentPhone };
}

export enum PhoneFields {
    phoneNumber = 'phoneNumber',
}

export interface PartyPhoneProps {
    isFormStateReadOnly?: boolean;
    fields?:
        | {
              fieldName: PhoneFields;
              fieldLabel: string;
          }[]
        | null;
    phone: Phone;
    formErrors?: FormValidationErrors;
    onDataChange: (value: Phone) => void;
}

const PartyPhone = ({
    fields,
    formErrors,
    phone,
    onDataChange,
    isFormStateReadOnly,
}: PartyPhoneProps) => {
    const { phoneNumberField, currentPhone } = usePhoneFields(
        phone,
        formErrors
    );

    useEffect(() => {
        onDataChange(currentPhone);
    }, [currentPhone]);
    if (!fields) {
        return null;
    }
    return (
        <div className="my-4 grid w-full grid-cols-2  gap-2">
            {fields?.map((field, index) => {
                if (field?.fieldName === PhoneFields.phoneNumber)
                    return (
                        <div key={index}>
                            {phoneNumberField({
                                label: field?.fieldLabel,
                                isFormStateReadOnly,
                            })}
                        </div>
                    );
                else null;
            })}
        </div>
    );
};

export default PartyPhone;
