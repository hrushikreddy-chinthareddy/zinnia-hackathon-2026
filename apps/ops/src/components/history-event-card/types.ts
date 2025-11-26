import { PayeeOrBeneficiary } from '@deps/models/policy-sor-touchups/Transaction';
import {
    Policy,
    Transaction,
    Transaction_Payor,
} from '@zinnia/api-types/types/sor';

export interface EventProps {
    policy: Policy;
    refreshTransactions: () => void;
    transaction: Transaction;
}

export interface GetBankAccount {
    payorsOrPayees?: PayeeOrBeneficiary[] | Transaction_Payor[];
    policy: Policy;
}

export enum PeopleChangeType {
    Add = 'add',
    Remove = 'remove',
    Update = 'update',
}
