import { Phone, PhoneType } from '@zinnia/api-types/types/sor';

import { formatPhoneNumber, formatPhoneNumberWithExtension, formatPhoneNumberRaw, formatPhoneNumberWithCountryCode } from './phone.helpers';

describe('Phone Formatter', () => {
    it('should format phone number correctly', () => {
        const phone: Phone = {
            startDate: '',
            endDate: '',
            phoneType: PhoneType.MOBILE,
            countryCode: '1',
            areaCode: '415',
            dialNumber: '5551234',
            extension: '',
            bestTime: '',
        };

        expect(formatPhoneNumber(phone)).toEqual('(415) 555-1234');
    });

    it('should format phone number with country code correctly', () => {
        const phone: Phone = {
            startDate: '',
            endDate: '',
            phoneType: PhoneType.MOBILE,
            countryCode: '1',
            areaCode: '415',
            dialNumber: '5551234',
            extension: '',
            bestTime: '',
        };

        expect(formatPhoneNumberWithCountryCode(phone)).toEqual('+1 (415) 555-1234');
    });

    it('should format phone number with extension correctly', () => {
        const phone: Phone = {
            startDate: '',
            endDate: '',
            phoneType: PhoneType.MOBILE,
            countryCode: '1',
            areaCode: '415',
            dialNumber: '5551234',
            extension: '321',
            bestTime: '',
        };

        expect(formatPhoneNumberWithExtension(phone)).toEqual('+1 (415) 555-1234 ext. 321');
    });

    it('should format phone number to raw correctly', () => {
        const phone: Phone = {
            startDate: '',
            endDate: '',
            phoneType: PhoneType.MOBILE,
            countryCode: '1',
            areaCode: '415',
            dialNumber: '5551234',
            extension: '',
            bestTime: '',
        };

        expect(formatPhoneNumberRaw(phone)).toEqual('4155551234');
    });
});
