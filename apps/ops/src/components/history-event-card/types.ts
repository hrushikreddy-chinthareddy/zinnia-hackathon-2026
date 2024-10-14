import { AccountType, Policy, Transaction, TransactionPayeeOrBeneficiariesItem, TransactionPayor } from "@deps/models/policy/sor-policy";

export interface EventProps {
    policy: Policy;
    refreshTransactions: () => void;
    transaction: Transaction;
}

export interface GetBankAccount {
    payorsOrPayees?: TransactionPayeeOrBeneficiariesItem[] | TransactionPayor[];
    policy: Policy;
}

export interface PayeeParty {
    allocationPercentage?: number;
    bankDetails: {
        accountNumber: string;
        accountType?: AccountType;
        branchName: string;
        nameOnAccount: string;
    };
    disbursementAmount?: number;
    partyId: string;
    state?: string;
}

export enum PeopleChangeType {
    Add = 'add',
    Remove = 'remove',
    Update = 'update',
}
