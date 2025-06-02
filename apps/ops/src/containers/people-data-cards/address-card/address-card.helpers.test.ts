import { Address, AddressType } from '@zinnia/api-types/types/sor';

import { sortAddressesByType } from './address-card.helpers';

jest.mock('@deps/utils/server-logging');

describe('sortAddressesByType', () => {
    const addresses: Address[] = [
        { addressId: '1', addressType: AddressType.RESIDENCE },
        { addressId: '2', addressType: AddressType.POBOX },
        { addressId: '3', addressType: AddressType.BUSINESS },
        { addressId: '4', addressType: AddressType.SEASONAL },
    ];

    it('should sort addresses by type', () => {
        const sortedAddresses = sortAddressesByType({ addresses });
        expect(sortedAddresses.length).toBe(addresses.length);
        expect(sortedAddresses[0].addressType).toBe(AddressType.RESIDENCE);
        expect(sortedAddresses[1].addressType).toBe(AddressType.POBOX);
        expect(sortedAddresses[2].addressType).toBe(AddressType.BUSINESS);
        expect(sortedAddresses[3].addressType).toBe(AddressType.SEASONAL);
    });

    it('should prioritize preferred addresses', () => {
        const preferredAddressIndicator = '3';
        const sortedAddresses = sortAddressesByType({ addresses, preferredAddressIndicator });
        expect(sortedAddresses[0].addressId).toBe(preferredAddressIndicator);
    });
});
