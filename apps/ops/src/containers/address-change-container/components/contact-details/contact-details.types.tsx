import {
    AddressType,
    Country,
    Policy,
    State,
} from '@zinnia/api-types/types/sor';

export enum ContactTypes {
    Address = 'address',
    Phone = 'phone',
}

export interface ContactDetailsProps {
    policy: Policy;
}

export const initialContactSelection = {
    isAddressChangeRequire: false,
    isPhoneChangeRequire: false,
};

export interface PolicyAddress {
    ID?: number;
    /** Address Line 1 of the party */
    AddressLine1?: string;
    /** Address Line 2 of the party */
    AddressLine2?: string;
    /** Address Line 3 of the party */
    AddressLine3?: string;
    addressType?: AddressType;
    /** City of the party address */
    City: string;
    State: State;
    Country?: Country;
    /** Zip code of the party address */
    Zip: string;
    /** Zip code extension of the party address */
    ZipPlusFour?: string;
}
