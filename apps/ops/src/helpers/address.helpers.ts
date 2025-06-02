import { Address } from '@zinnia/api-types/types/sor';

import { getCountryByCode } from './countries.helpers';
import { getStateCode } from './states.helpers';
import { toTitleCase } from './string.helpers';

export function formatCityStateZip(address: Address): string {
    let formattedAddress = '';
    if (address.city) {
        formattedAddress += `${toTitleCase(address.city)}`;
    }
    if (address.state) {
        formattedAddress += `, ${getStateCode(address.state)}`;
    }
    if (address.zipCode) {
        formattedAddress += ` ${address.zipCode}`;
    }
    if (address.zipCodeExtension) {
        formattedAddress += `-${address.zipCodeExtension}`;
    }
    return formattedAddress;
}

export function formatZipCode(address: Address): string {
    let formattedAddress = '';
    if (address.zipCode) {
        formattedAddress += address.zipCode;
    }
    if (address.zipCodeExtension) {
        formattedAddress += `-${address.zipCodeExtension}`;
    }
    return formattedAddress;
}

export function formatZipCodeRaw(address: Address): string {
    let formattedAddress = '';
    if (address.zipCode) {
        formattedAddress += address.zipCode;
    }
    if (address.zipCodeExtension) {
        formattedAddress += address.zipCodeExtension;
    }
    return formattedAddress;
}

export const formatAddress = (address: Address): string[] => {
    if (!Object.keys(address).length) return ['', '', ''];

    const addressLines = [address?.addressLine1, address?.addressLine2, address?.addressLine3]
        .filter(Boolean)
        .map(line => toTitleCase(line))
        .join(', ');

    const formatted = [
        addressLines,
        `${toTitleCase(address?.city)}, ${address?.state} ${address?.zipCode}${
            address?.zipCodeExtension ? `-${address?.zipCodeExtension}` : ''
        }`,
        getCountryByCode(address?.country),
    ];

    return formatted;
};

//V2 for using toUppercase and skipping country code
export const formatAddressV2 = (address: Address): string[] => {
    if (!Object.keys(address).length) return ['', '', ''];

    const addressLines = [address?.addressLine1, address?.addressLine2, address?.addressLine3]
        .filter(Boolean)
        .map(line => toTitleCase(line))
        .join(', ');

    const formatted = [
        addressLines.toUpperCase(),
        `${address?.city?.toUpperCase()}, ${address?.state?.toUpperCase()} ${address?.zipCode || ''} ${
            address?.zipCodeExtension ? `-${address?.zipCodeExtension}` : ''
        }`,
    ];

    return formatted;
};
