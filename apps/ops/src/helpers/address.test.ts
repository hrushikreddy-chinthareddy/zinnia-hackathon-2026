import { cleanup } from '@testing-library/react';

import {
    Address,
    AddressType,
    State,
    Country,
} from '@zinnia/api-types/types/sor';

import {
    formatAddress,
    formatAddressV2,
    formatCityStateZip,
    formatZipCode,
    formatZipCodeRaw,
} from './address.helpers';

describe('address.helpers', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it('should format a complete address', () => {
        const address: Address = {
            addressId: '1',
            startDate: '2023-06-01',
            endDate: '2023-12-31',
            addressType: AddressType.RESIDENCE,
            addressLine1: '123 Main St',
            addressLine2: 'Apt 4B',
            addressLine3: '',
            city: 'Los Angeles',
            state: State.CA,
            zipCode: '90001',
            zipCodeExtension: '1234',
            country: Country.US,
        };
        expect(formatCityStateZip(address)).toBe('Los Angeles, CA 90001-1234');
    });

    it('should handle empty zip ext field gracefully', () => {
        const address: Address = {
            addressId: '1',
            startDate: '2023-06-01',
            endDate: '2023-12-31',
            addressType: AddressType.RESIDENCE,
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            city: 'Los Angeles',
            state: State.CA,
            zipCode: '90001',
            zipCodeExtension: '',
            country: Country.US,
        };
        expect(formatCityStateZip(address)).toBe('Los Angeles, CA 90001');
    });

    it('should format the address correctly', () => {
        const address = {
            addressLine1: '123 Main Street',
            addressLine2: 'Suite 456',
            city: 'Cityville',
            state: State.AL,
            zipCode: '12345',
            zipCodeExtension: '6789',
            country: Country.US,
        };

        const formattedAddress = formatAddress(address as Address);

        expect(formattedAddress).toEqual([
            '123 Main Street, Suite 456',
            'Cityville, AL 12345-6789',
            'US',
        ]);
    });

    it('should handle missing address fields', () => {
        const address = {
            addressLine1: '123 Main Street',
            city: 'Cityville',
            state: State.AL,
            zipCode: '12345',
            country: undefined,
        };

        const formattedAddress = formatAddress(address as Address);

        expect(formattedAddress).toEqual([
            '123 Main Street',
            'Cityville, AL 12345',
            '--',
        ]);
    });

    it('should handle an empty address object', () => {
        const address = {};

        const formattedAddress = formatAddress(address as Address);

        expect(formattedAddress).toEqual(['', '', '']);
    });

    it('formatCityStateZip applies title/state code and handles missing pieces', () => {
        expect(formatCityStateZip({ city: 'new york' } as any)).toBe(
            'New York'
        );
        expect(
            formatCityStateZip({ city: 'new york', state: State.NY } as any)
        ).toBe('New York, NY');
        expect(
            formatCityStateZip({ state: State.TX, zipCode: '73301' } as any)
        ).toBe(', TX 73301');
        expect(
            formatCityStateZip({
                zipCode: '10001',
                zipCodeExtension: '0001',
            } as any)
        ).toBe(' 10001-0001');
    });

    it('formatZipCode returns dash-separated zip and extension', () => {
        expect(
            formatZipCode({ zipCode: '94105', zipCodeExtension: '1234' } as any)
        ).toBe('94105-1234');
        expect(formatZipCode({ zipCode: '94105' } as any)).toBe('94105');
        expect(formatZipCode({ zipCodeExtension: '1234' } as any)).toBe(
            '-1234'
        );
        expect(formatZipCode({} as any)).toBe('');
    });

    it('formatZipCodeRaw concatenates without dash', () => {
        expect(
            formatZipCodeRaw({
                zipCode: '94105',
                zipCodeExtension: '1234',
            } as any)
        ).toBe('941051234');
        expect(formatZipCodeRaw({ zipCode: '94105' } as any)).toBe('94105');
        expect(formatZipCodeRaw({ zipCodeExtension: '1234' } as any)).toBe(
            '1234'
        );
        expect(formatZipCodeRaw({} as any)).toBe('');
    });

    it('formatAddressV2 uppercases lines and city/state; handles zip pieces', () => {
        const address = {
            addressLine1: '123 main street',
            addressLine2: 'suite 456',
            addressLine3: '',
            city: 'Cityville',
            state: State.AL,
            zipCode: '12345',
            zipCodeExtension: '6789',
        } as Address;

        expect(formatAddressV2(address)).toEqual([
            '123 MAIN STREET, SUITE 456',
            'CITYVILLE, AL 12345 -6789',
        ]);

        // No extension
        expect(
            formatAddressV2({ ...address, zipCodeExtension: undefined } as any)
        ).toEqual(['123 MAIN STREET, SUITE 456', 'CITYVILLE, AL 12345 ']);

        // Empty object
        expect(formatAddressV2({} as any)).toEqual(['', '', '']);
    });
});
