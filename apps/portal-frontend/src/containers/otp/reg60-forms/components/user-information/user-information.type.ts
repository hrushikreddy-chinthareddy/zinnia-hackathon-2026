import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { AddressConfigInterface } from '../address-details/address-details.type';

export interface UserInformationConfig {
    title: string;
    titleTooltip: string;
    userFields: {
        fields: {
            firstName: {
                fieldName: string;
                fieldLabel: string;
            };
            middleName: {
                fieldName: string;
                fieldLabel: string;
            };
            lastName: {
                fieldName: string;
                fieldLabel: string;
            };
            userPhoneNumber?: {
                fieldName: string;
                fieldLabel: string;
            };
            userSSN?: {
                fieldName: string;
                fieldLabel: string;
            };
            channel?: {
                fieldName: string;
                fieldLabel: string;
            };
            userCompany?: {
                fieldName: string;
                fieldLabel: string;
            };
            extension?: {
                fieldName: string;
                fieldLabel: string;
            };
            phoneType?: {
                home?: {
                    fieldName: string;
                    fieldLabel: string;
                };
                work: {
                    fieldName: string;
                    fieldLabel: string;
                };
                mobile: {
                    fieldName: string;
                    fieldLabel: string;
                };
            };
        };
    };

    addressFields: AddressConfigInterface;
}

type PersonalInformation = {
    firstName: string;
    middleName: string;
    lastName: string;
    phoneNumber: string;
    ssNumber: string;
    phoneExtension?: string;
    phoneType: {
        home?: boolean;
        work: boolean;
        mobile: boolean;
    };
};

interface AddressDetails {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface UserInfo {
    personalInformation: PersonalInformation;
    companyName?: string;
    channel?: string;
    addressDetails: AddressDetails;
}

export enum ChannelType {
    CAS = 'CAS',
    Broker = 'BROKER',
}

export interface UserInformationProps {
    userInfo: UserInfo;
    setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
    formErrors: FormValidationErrors;
    formConfig: UserInformationConfig;
}
