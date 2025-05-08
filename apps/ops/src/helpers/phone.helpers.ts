import { Party, Phone, PhoneType } from '@deps/models/policy/sor-policy';

import { isEndDated } from './date.helpers';

export function formatPhoneNumber(phone: Phone): string {
    let formattedNumber = '';
    if (phone.areaCode) {
        formattedNumber += `(${phone.areaCode}) `;
    }
    if (phone.dialNumber) {
        formattedNumber += `${phone.dialNumber.substring(0, 3)}-${phone.dialNumber.substring(3, 8)}`;
    }
    return formattedNumber;
}

export function formatPhoneNumberRaw(phone: Phone): string {
    let rawNumber = '';
    if (phone.areaCode) {
        rawNumber += phone.areaCode;
    }
    if (phone.dialNumber) {
        rawNumber += phone.dialNumber;
    }
    return rawNumber;
}

export function formatPhoneNumberWithCountryCode(phone: Phone): string {
    let formattedNumber = '';
    if (phone.countryCode) {
        formattedNumber += `+${phone.countryCode}`;
    }
    if (phone.areaCode) {
        formattedNumber += ` (${phone.areaCode}) `;
    }
    if (phone.dialNumber) {
        formattedNumber += `${phone.dialNumber.substring(0, 3)}-${phone.dialNumber.substring(3, 8)}`;
    }
    return formattedNumber;
}

export function formatPhoneNumberWithExtension(phone: Phone): string {
    let formattedNumber = '';
    if (phone.countryCode) {
        formattedNumber += `+${phone.countryCode}`;
    }
    if (phone.areaCode) {
        formattedNumber += ` (${phone.areaCode}) `;
    }
    if (phone.dialNumber) {
        formattedNumber += `${phone.dialNumber.substring(0, 3)}-${phone.dialNumber.substring(3, 8)}`;
    }
    if (phone.extension) {
        formattedNumber += ` ext. ${phone.extension}`;
    }
    return formattedNumber;
}

interface BestAvailableContactNumberProps {
    party: Party;
}

export interface BestAvailableContactNumberResponse {
    contactNumber: Phone | null;
    phoneType: PhoneType | null;
}

export function bestAvailableContactNumber({ party }: BestAvailableContactNumberProps): BestAvailableContactNumberResponse {
    const contactNumbers = party?.phones?.filter(phone => phone.dialNumber !== null && !isEndDated(phone.endDate)) || [];
    const bestFitOrder = [PhoneType.MOBILE, PhoneType.HOME, PhoneType.BUSINESS, PhoneType.OTHER, PhoneType.FAX];

    let bestAvailable;
    let phoneTypeBestFit = null;
    for (let i = 0; i < bestFitOrder.length; i++) {
        const potentials = contactNumbers?.filter(phone => phone.phoneType === bestFitOrder[i]);
        if (potentials.length) {
            bestAvailable = potentials[0];
            phoneTypeBestFit = bestFitOrder[i];
            break; // short circuit the loop
        }
    }

    if (!bestAvailable) {
        return { contactNumber: null, phoneType: null };
    }

    return { contactNumber: bestAvailable, phoneType: phoneTypeBestFit };
}
