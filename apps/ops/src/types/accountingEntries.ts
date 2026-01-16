import { AccountingEntries } from '@zinnia/api-types/types/sor';

export interface AccountingEntriesAPIParams {
    carrierId?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    planCode?: string;
    policyNumber?: string;
    qualificationType?: string;
    startDate?: string;
    transactionId?: string;
}

export type AccountingEntriesAPIResponse = {
    count: number;
    data: AccountingEntries[];
    limit: number;
    message: string;
    offset: number;
    status: number;
    total: number;
};
