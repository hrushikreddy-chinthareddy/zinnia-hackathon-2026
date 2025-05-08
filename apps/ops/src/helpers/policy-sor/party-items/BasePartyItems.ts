import { isEndDated } from '@deps/helpers/date.helpers';
import { Address, BankAccount, Email, Phone } from '@deps/models/policy/sor-policy';

export abstract class BasePartyItems<T extends Address | BankAccount | Email | Phone> {
    private contactsList: T[];
    constructor(contactsList: T[] = []) {
        this.contactsList = contactsList;
    }

    abstract get preferred(): T | undefined;
    abstract get bestAvailable(): T | undefined;
    abstract getById(id: string): T | undefined;

    get currentList(): T[] {
        return this.contactsList.filter(contact => !isEndDated(contact.endDate));
    }

    get historicalList(): T[] {
        return this.contactsList;
    }
}
