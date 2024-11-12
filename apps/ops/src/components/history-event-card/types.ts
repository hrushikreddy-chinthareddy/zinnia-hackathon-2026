import { Policy, Transaction, TransactionPayeeOrBeneficiariesItem, TransactionPayor } from "@deps/models/policy/sor-policy";

export interface EventProps {
    policy: Policy;
    refreshTransactions: () => void;
    transaction: Transaction;
}

export interface GetBankAccount {
    payorsOrPayees?: TransactionPayeeOrBeneficiariesItem[] | TransactionPayor[];
    policy: Policy;
}

export enum PeopleChangeType {
    Add = 'add',
    Remove = 'remove',
    Update = 'update',
}
