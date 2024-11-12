import { Dispatch, SetStateAction } from 'react';

import { Address, BankAccount, Email, Phone } from '@deps/models/policy/sor-policy';
import { NonFinancialTransactionActions } from '@deps/queries/api/bpm-non-financial';

export enum NonFinancialTransactionIdKeys {
    Address = 'addressId',
    BankAccount = 'bankId',
    Email = 'emailId',
    Phone = 'phoneId',
}

export type AddressWithPending = Address & { isPending?: boolean };
export type BankAccountWithPending = BankAccount & { isPending?: boolean };
export type EmailWithPending = Email & { isPending?: boolean };
export type PhoneWithPending = Phone & { isPending?: boolean };

interface UpdateOptimistically {
    action: NonFinancialTransactionActions;
    idKey: NonFinancialTransactionIdKeys;
    newItem: Address | BankAccount | Email | Phone;
    setState: Dispatch<SetStateAction<Address[] | BankAccount[] | Email[] | Phone[]>>;
}

// accept all non financial transactions with their namespaced id keys, i.e. address.addressId
type LooseIdObject = { [key in NonFinancialTransactionIdKeys]: string };

export const updateOptimistically = ({ action, idKey, newItem, setState }: UpdateOptimistically) => {
    switch (action) {
        case NonFinancialTransactionActions.Add: {
            setState(prevState => [...prevState, { ...newItem, isPending: true }]);

            break;
        }
        case NonFinancialTransactionActions.Edit: {
            setState(prevState => [
                ...prevState.filter(item => (item as LooseIdObject)[idKey] !== (newItem as LooseIdObject)[idKey]),
                { ...newItem, isPending: true },
            ]);

            break;
        }
        case NonFinancialTransactionActions.Delete: {
            setState(prevState => prevState.filter(item => (item as LooseIdObject)[idKey] !== (newItem as LooseIdObject)[idKey]));

            break;
        }
    }
};
