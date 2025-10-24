import { Address } from '@zinnia/api-types/types/sor';

import { sortAddressesByType } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { isEndDated } from '@deps/helpers/date.helpers';

import { BasePartyItems } from './BasePartyItems';

export class Addresses extends BasePartyItems<Address> {
    public addressById: Record<string, Address>;
    constructor(addresses: Address[] = []) {
        super(addresses);
        this.addressById = this.historicalList.reduce((acc, address) => {
            if (address.addressId) {
                acc[address.addressId] = address;
            }
            return acc;
        }, {} as Record<string, Address>);
    }

    public get bestAvailable(): Address | undefined {
        return (
            this.preferred ||
            sortAddressesByType({ addresses: this.currentList })?.[0]
        );
    }

    public getById(id: string): Address | undefined {
        return this.addressById[id];
    }

    public get preferred(): Address | undefined {
        return this.currentList?.find(
            (address) => address.isPreferred && !isEndDated(address.endDate)
        );
    }
}
