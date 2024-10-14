import { sortAddressesByType } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { isEndDated } from '@deps/helpers/date.helper';
import { Address } from '@deps/models/policy/sor-policy';

import { BasePartyItems } from './BasePartyItems';

export class Addresses extends BasePartyItems<Address> {
    private preferredAddressIndicator: string | undefined;
    public addressById: Record<string, Address>;
    constructor(addresses: Address[] = [], preferredAddressIndicator?: string) {
        super(addresses);
        this.preferredAddressIndicator = preferredAddressIndicator;
        this.addressById = this.historicalList.reduce((acc, address) => {
            if (address.addressId) {
                acc[address.addressId] = address;
            }
            return acc;
        }, {} as Record<string, Address>);
    }

    public get bestAvailable(): Address | undefined {
        return this.preferred || sortAddressesByType({ addresses: this.currentList })?.[0];
    }

    public getById(id: string): Address | undefined {
        return this.addressById[id];
    }

    public get preferred(): Address | undefined {
        if (this.preferredAddressIndicator) {
            return this.currentList?.find(address => address.addressId === this.preferredAddressIndicator);
        }
        // BPB - preferredAddress was showing up in QA.  Use it if we have it
        return this.currentList?.find(
            address => (address as Address & { preferredAddress: boolean }).preferredAddress && !isEndDated(address.endDate)
        );
    }
}
