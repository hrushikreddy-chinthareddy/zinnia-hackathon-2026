import { Phone, PhoneType } from '@zinnia/api-types/types/sor';

import { BasePartyItems } from './BasePartyItems';

export class Phones extends BasePartyItems<Phone> {
    public phoneById: Record<string, Phone>;
    constructor(phones: Phone[] = []) {
        super(phones);
        this.phoneById = this.historicalList.reduce((acc, phone) => {
            if (phone.phoneId) {
                // only add if phoneId is defined
                acc[phone.phoneId] = phone;
            }
            return acc;
        }, {} as Record<string, Phone>);
    }

    public get bestAvailable(): Phone | undefined {
        const bestFitOrder = [
            PhoneType.MOBILE,
            PhoneType.HOME,
            PhoneType.BUSINESS,
            PhoneType.OTHER,
            PhoneType.FAX,
        ];
        let bestAvailable;
        for (let i = 0; i < bestFitOrder.length; i++) {
            const potentials = this.currentList?.filter(
                (phone) =>
                    phone.phoneType === bestFitOrder[i] && phone.dialNumber
            );
            if (potentials.length) {
                bestAvailable = potentials[0];
                break; // short circuit the loop
            }
        }
        return bestAvailable;
    }

    public getById(id: string): Phone | undefined {
        return this.phoneById[id];
    }

    public get preferred(): Phone | undefined {
        // BPB - TODO: get preferred Phone logic
        return this.bestAvailable;
    }
}
