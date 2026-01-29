import { PayeeOrBeneficiary } from '@deps/models/policy-sor-touchups/Transaction';
import {
    Policy,
    Transaction,
    TransactionPayor,
} from '@zinnia/api-types/types/sor';

export interface EventProps {
    policy: Policy;
    refreshTransactions: () => void;
    transaction: Transaction;
}

export interface GetBankAccount {
    payorsOrPayees?: PayeeOrBeneficiary[] | TransactionPayor[];
    policy: Policy;
}

export enum PeopleChangeType {
    Add = 'add',
    Remove = 'remove',
    Update = 'update',
}
