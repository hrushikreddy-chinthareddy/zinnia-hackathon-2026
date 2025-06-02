import { Address, Phone } from '@zinnia/api-types/types/sor';

import { ApplyToRolesState } from '@deps/containers/address-change-container/types/address-change-types';

import { AssociateAddressTableRow } from './roles-contract-types';

// import { AssociateAddressTableRow } from "./roles-contract-helper";

export const mapRoleItemToRoleState = (option: AssociateAddressTableRow): ApplyToRolesState => {
    return {
        policyNumber: option?.policyNumber ?? '',
        partyRoleId: option?.partyRoleId?.toString() ?? '',
        partyRole: (option?.partyRole ?? '') as ApplyToRolesState['partyRole'],
        partyId: option?.partyId ?? '',
    };
};

export const mapAddressToAddressCardData = (address: Address | undefined) => {
    if (address) {
        return {
            addressId: address?.addressId,
            addressLine1: address?.addressLine1,
            addressLine2: address?.addressLine2,
            addressLine3: address?.addressLine3,
            city: address?.city,
            state: address?.state,
            zipCode: address?.zipCode,
            zipCodeExtension: address?.zipCodeExtension,
        };
    }
};

export const mapPhoneToAddressCardData = (address: Phone | undefined) => ({
    phoneId: address?.phoneId,
    countryCode: address?.countryCode,
    areaCode: address?.areaCode,
    dialNumber: address?.dialNumber,
    extension: address?.extension,
});
