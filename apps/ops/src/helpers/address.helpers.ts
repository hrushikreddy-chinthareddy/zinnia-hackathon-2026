import { State } from '@zinnia/api-types/types/bpm';
import { Address, Country } from '@zinnia/api-types/types/sor';

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

export interface AddressFields {
    AddressLine1: string;
    AddressLine2?: string;
    AddressLine3?: string;
    City: string;
    State: State;
    ZipCodeExtension?: string;
    ZipCode: string;
    Country: Country;
}
export const convertAddressFields = (address: AddressFields) => {
    return {
        addressLine1: address?.AddressLine1 ?? '',
        addressLine2: address?.AddressLine2 ?? ' ',
        addressLine3: address?.AddressLine3 ?? '',
        city: address?.City ?? '',
        state: address?.State ?? '',
        zipCode: address?.ZipCode ?? '',
        zipCodeExtension: address?.ZipCodeExtension || ' ',
        country: address?.Country ?? '',
    };
};

export const formatAddress = (address: Address): string[] => {
    if (!Object.keys(address).length) return ['', '', ''];

    const addressLines = [
        address?.addressLine1,
        address?.addressLine2,
        address?.addressLine3,
    ]
        .filter(Boolean)
        .map((line) => toTitleCase(line))
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

    const addressLines = [
        address?.addressLine1,
        address?.addressLine2,
        address?.addressLine3,
    ]
        .filter(Boolean)
        .map((line) => toTitleCase(line))
        .join(', ');

    const formatted = [
        addressLines.toUpperCase(),
        `${address?.city?.toUpperCase()}, ${address?.state?.toUpperCase()} ${
            address?.zipCode || ''
        } ${address?.zipCodeExtension ? `-${address?.zipCodeExtension}` : ''}`,
    ];

    return formatted;
};
