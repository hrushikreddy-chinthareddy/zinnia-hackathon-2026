import {
    AddressTypes,
    FormValidationErrors,
} from '@deps/models/case/withdrawal/case';

import { UserInfo } from '../user-information/user-information.type';

export interface AddressFieldsInterface {
    StreetAddress: string;
    StreetAddress2: string;
    StreetAddress3: string;
    City: string;
    State: string;
    Zip: string;
}

export interface AddressConfigInterface {
    fields: {
        streetAddress: {
            fieldName: AddressFieldsInterface['StreetAddress'];
            fieldLabel: string;
        };
        streetAddress2: {
            fieldName: AddressFieldsInterface['StreetAddress2'];
            fieldLabel: string;
        };
        streetAddress3: {
            fieldName: AddressFieldsInterface['StreetAddress3'];
            fieldLabel: string;
        };
        city: {
            fieldName: AddressFieldsInterface['City'];
            fieldLabel: string;
        };
        state: {
            fieldName: AddressFieldsInterface['State'];
            fieldLabel: string;
        };
        zip: {
            fieldName: AddressFieldsInterface['Zip'];
            fieldLabel: string;
        };
    };
}

export enum AddressField {
    StreetAddress = 'streetAddress',
    StreetAddress2 = 'streetAddress2',
    StreetAddress3 = 'streetAddress3',
    City = 'city',
    State = 'state',
    Zip = 'zip',
}
export interface AddressDetailsProps {
    userData: UserInfo;
    errors?: FormValidationErrors;
    setUserData: any;
    addressFieldConfig: AddressConfigInterface;
    isPayeeAddress?: boolean;
    isFormStateReadOnly?: boolean;
}

export interface Address {
    addressLine1: string;
    addressLine2?: string | null;
    addressLine3?: string | null;
    addressLine4?: string | null;
    addressType: AddressTypes;
    city: string | null;
    country?: string | null;
    state: string;
    zip: string;
    zipPlusFour?: string | null;
}
