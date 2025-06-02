import { Address, BankAccount, Email, Phone } from '@zinnia/api-types/types/sor';
import { Dispatch, SetStateAction } from 'react';

import { NonFinancialTransactionActions } from '@deps/queries/api/bpm-non-financial';

import { BaseTransactionSideSheetValues } from '../types';

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

export interface UpdateOptimistically {
    action: NonFinancialTransactionActions;
    idKey: NonFinancialTransactionIdKeys;
    newItem: Address | BankAccount | Email | Phone;
    setState: Dispatch<SetStateAction<Address[] | BankAccount[] | Email[] | Phone[]>>;
}

// accept all non financial transactions with their namespaced id keys, i.e. address.addressId
export type LooseIdObject = { [key in NonFinancialTransactionIdKeys]: string };

export interface NonFinancialTransactionSideSheetValues extends BaseTransactionSideSheetValues {
    effectiveDate?: string;
    name?: string;
    roleTags?: string[];
}
