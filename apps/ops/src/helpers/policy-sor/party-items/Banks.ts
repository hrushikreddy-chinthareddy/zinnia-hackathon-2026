import { BankAccount } from '@zinnia/api-types/types/sor';

import { BasePartyItems } from './BasePartyItems';

export class Banks extends BasePartyItems<BankAccount> {
    public bankById: Record<string, BankAccount>;
    constructor(banks: BankAccount[] = []) {
        super(banks);
        this.bankById = this.historicalList.reduce((acc, bank) => {
            if (bank.bankId) {
                acc[bank.bankId] = bank;
            }
            return acc;
        }, {} as Record<string, BankAccount>);
    }

    // BPB - find better logic
    public get bestAvailable(): BankAccount | undefined {
        return this.preferred;
    }

    public getById(bankId: string): BankAccount | undefined {
        return this.bankById[bankId];
    }

    public get preferred(): BankAccount | undefined {
        // BPB - TODO: get preferred bank logic
        return this.currentList?.[0];
    }
}
