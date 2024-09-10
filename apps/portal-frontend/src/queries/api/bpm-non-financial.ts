import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';

import { AddressBase, BankAccountBase, EmailBase, PhoneBase } from '@deps/models/policy/sor-policy';
import { baseAppUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

const baseUrl = `${baseAppUrl}/api/bpm/v1`;

export enum PreferredAddressIndicator {
    'Yes' = 'YES',
    'No' = 'NO',
}

export enum NonFinancialTransactionActions {
    Add = 'add',
    Delete = 'delete',
    Edit = 'edit',
}

export enum NonFinancialTransactions {
    Address = 'address',
    Allocations = 'allocations',
    BankAccount = 'bankaccount',
    Email = 'email',
    EmailAddress = 'emailaddress',
    Number = 'number',
    Phone = 'phone',
}

export interface NonFinancialTransactionBody {
    caseId?: string;
    correlationId: string;
    effectiveDate: string;
    deleteRequest?: boolean;
    preferredAddressIndicator?: PreferredAddressIndicator;
    reverseInitiator?: boolean;
}

interface AddressBody extends NonFinancialTransactionBody {
    address: AddressBase;
}

interface BankAccountBody extends NonFinancialTransactionBody {
    bankAccount: BankAccountBase;
}

interface EmailBody extends NonFinancialTransactionBody {
    email: EmailBase;
}

interface PhoneBody extends NonFinancialTransactionBody {
    phone: PhoneBase;
}

interface NonFinancialTransaction {
    body: AddressBody | BankAccountBody | EmailBody | PhoneBody;
    partyId?: string;
    planCode?: string;
    policyNumber?: string;
    transaction: NonFinancialTransactions;
}

interface AddNonFinancialTransaction extends NonFinancialTransaction {}
interface EditNonFinancialTransaction extends NonFinancialTransaction {
    itemId?: string;
}

export const addNonFinancialTransaction = async ({
    body,
    partyId,
    planCode,
    policyNumber,
    transaction,
}: AddNonFinancialTransaction): Promise<any> => {
    if (!planCode || !policyNumber || !partyId) {
        console.error('addNonFinancialTransaction::missing plancode, policyNumber, or partyId');
        return;
    }

    try {
        const response = await client.post<any, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/parties/${partyId}/${transaction}`,
            body
        );

        return response;
    } catch (error: any) {
        // 400 is a BPM validation error
        if (error?.status === StatusCode.BadRequest) {
            console.warn('addNonFinancialTransaction::BPM error occurred', error);
        } else {
            console.error('addNonFinancialTransaction::an error occurred', error);
        }
        return error;
    }
};

export const editNonFinancialTransaction = async ({
    body,
    itemId,
    partyId,
    planCode,
    policyNumber,
    transaction,
}: EditNonFinancialTransaction): Promise<any> => {
    if (!itemId || !planCode || !policyNumber || !partyId) {
        console.error('editNonFinancialTransaction::missing itemid, plancode, policyNumber, or partyId');
        return;
    }

    const today = dayjs().format(ZAHARA_API_DATE_FORMAT);

    if ((body as AddressBody).address) (body as AddressBody).address.startDate = today;
    if ((body as EmailBody).email) (body as EmailBody).email.startDate = today;
    if ((body as PhoneBody).phone) (body as PhoneBody).phone.startDate = today;

    try {
        const response = await client.put<any, AxiosResponse>(
            `${baseUrl}/policies/${planCode}/${policyNumber}/parties/${partyId}/${transaction}/${itemId}`,
            body
        );

        return response;
    } catch (error: any) {
        // 400 is a BPM validation error
        if (error?.status === StatusCode.BadRequest) {
            console.warn('editNonFinancialTransaction::BPM error occurred', error);
        } else {
            console.error('editNonFinancialTransaction::an error occurred', error);
        }
        return error;
    }
};
