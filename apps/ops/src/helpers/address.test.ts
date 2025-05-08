import { Address } from '@deps/models/policy/sor-policy';

import { formatAddress, formatCityStateZip } from './address.helpers';

describe('formatFullAddress', () => {
    it('should format a complete address', () => {
        const address: Address = {
            addressId: '1',
            startDate: '2023-06-01',
            endDate: '2023-12-31',
            addressType: 'RESIDENCE',
            addressLine1: '123 Main St',
            addressLine2: 'Apt 4B',
            addressLine3: '',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            zipCodeExtension: '1234',
            country: 'US',
        };
        expect(formatCityStateZip(address)).toBe('Los Angeles, CA 90001-1234');
    });

    it('should handle empty zip ext field gracefully', () => {
        const address: Address = {
            addressId: '1',
            startDate: '2023-06-01',
            endDate: '2023-12-31',
            addressType: 'RESIDENCE',
            addressLine1: '',
            addressLine2: '',
            addressLine3: '',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90001',
            zipCodeExtension: '',
            country: 'US',
        };
        expect(formatCityStateZip(address)).toBe('Los Angeles, CA 90001');
    });

    it('should format the address correctly', () => {
        const address = {
            addressLine1: '123 Main Street',
            addressLine2: 'Suite 456',
            city: 'Cityville',
            state: 'ST',
            zipCode: '12345',
            zipCodeExtension: '6789',
            country: 'US',
        };

        const formattedAddress = formatAddress(address as Address);

        expect(formattedAddress).toEqual(['123 Main Street, Suite 456', 'Cityville, ST 12345-6789', 'US']);
    });

    it('should handle missing address fields', () => {
        const address = {
            addressLine1: '123 Main Street',
            city: 'Cityville',
            state: 'ST',
            zipCode: '12345',
            country: '',
        };

        const formattedAddress = formatAddress(address as Address);

        expect(formattedAddress).toEqual(['123 Main Street', 'Cityville, ST 12345', '--']);
    });

    it('should handle an empty address object', () => {
        const address = {};

        const formattedAddress = formatAddress(address as Address);

        expect(formattedAddress).toEqual(['', '', '']);
    });
});
