import { cleanup } from '@testing-library/react';

jest.mock('./date.helpers', () => ({
    isEndDated: () => false,
}));

import { PhoneType } from '@zinnia/api-types/types/sor';

import {
    formatPhoneNumber,
    formatPhoneNumberRaw,
    formatPhoneNumberWithCountryCode,
    formatPhoneNumberWithExtension,
    bestAvailableContactNumber,
} from './phone.helpers';

describe('helpers/phone.helpers', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    describe('formatPhoneNumber', () => {
        it('formats (area) XXX-XXXX when both provided', () => {
            const phone: any = { areaCode: '415', dialNumber: '5551234' };
            expect(formatPhoneNumber(phone)).toBe('(415) 555-1234');
        });
        it('handles missing areaCode or dialNumber', () => {
            expect(formatPhoneNumber({ areaCode: '212' } as any)).toBe(
                '(212) '
            );
            expect(formatPhoneNumber({ dialNumber: '5551234' } as any)).toBe(
                '555-1234'
            );
            expect(formatPhoneNumber({} as any)).toBe('');
        });
    });

    describe('formatPhoneNumberRaw', () => {
        it('concatenates areaCode and dialNumber without separators', () => {
            expect(
                formatPhoneNumberRaw({
                    areaCode: '650',
                    dialNumber: '7770000',
                } as any)
            ).toBe('6507770000');
            expect(formatPhoneNumberRaw({ areaCode: '800' } as any)).toBe(
                '800'
            );
            expect(formatPhoneNumberRaw({ dialNumber: '1234567' } as any)).toBe(
                '1234567'
            );
            expect(formatPhoneNumberRaw({} as any)).toBe('');
        });
    });

    describe('formatPhoneNumberWithCountryCode', () => {
        it('prepends +country and formats rest', () => {
            const phone: any = {
                countryCode: '1',
                areaCode: '310',
                dialNumber: '9998888',
            };
            expect(formatPhoneNumberWithCountryCode(phone)).toBe(
                '+1 (310) 999-8888'
            );
        });
        it('handles missing parts', () => {
            expect(
                formatPhoneNumberWithCountryCode({ countryCode: '44' } as any)
            ).toBe('+44');
            expect(
                formatPhoneNumberWithCountryCode({
                    areaCode: '020',
                    dialNumber: '1234567',
                } as any)
            ).toBe(' (020) 123-4567');
        });
    });

    describe('formatPhoneNumberWithExtension', () => {
        it('appends extension when present', () => {
            const phone: any = {
                countryCode: '1',
                areaCode: '646',
                dialNumber: '1234567',
                extension: '99',
            };
            expect(formatPhoneNumberWithExtension(phone)).toBe(
                '+1 (646) 123-4567 ext. 99'
            );
        });
        it('omits extension when not present', () => {
            const phone: any = {
                countryCode: '1',
                areaCode: '646',
                dialNumber: '1234567',
            };
            expect(formatPhoneNumberWithExtension(phone)).toBe(
                '+1 (646) 123-4567'
            );
        });
    });

    describe('bestAvailableContactNumber', () => {
        it('chooses best fit order MOBILE > HOME > BUSINESS > OTHER > FAX', () => {
            const party: any = {
                phones: [
                    { phoneType: PhoneType.FAX, dialNumber: '1111111' },
                    { phoneType: PhoneType.OTHER, dialNumber: '2222222' },
                    { phoneType: PhoneType.HOME, dialNumber: '3333333' },
                ],
            };
            const res = bestAvailableContactNumber({ party });
            expect(res.phoneType).toBe(PhoneType.HOME);
            expect(res.contactNumber?.dialNumber).toBe('3333333');
        });

        it('returns MOBILE when available and not end dated', () => {
            const party: any = {
                phones: [
                    {
                        phoneType: PhoneType.MOBILE,
                        dialNumber: '7777777',
                        endDate: undefined,
                    },
                ],
            };
            const res = bestAvailableContactNumber({ party });
            expect(res.phoneType).toBe(PhoneType.MOBILE);
        });

        it('filters out null dialNumber and returns null when none remain', () => {
            const party: any = {
                phones: [
                    { phoneType: PhoneType.MOBILE, dialNumber: null },
                    { phoneType: PhoneType.HOME, dialNumber: null },
                ],
            };
            const res = bestAvailableContactNumber({ party });
            expect(res).toEqual({ contactNumber: null, phoneType: null });
        });

        it('returns null when no phones', () => {
            const res = bestAvailableContactNumber({ party: {} as any });
            expect(res).toEqual({ contactNumber: null, phoneType: null });
        });
    });
});
