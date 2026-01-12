import { HistoryFilters } from '@deps/contexts/HistoryFiltersContext';

export type PolicyTransactionSortField =
    | 'EFFECTIVEDATE'
    | 'PROCESSDATE'
    | 'REVERSALDATE';

export type PolicyTransactionSortOrder = 'ASC' | 'DESC';

export interface GetTransactionsProps {
    historyFilters: HistoryFilters;
    policyNumber?: string;
    planCode?: string;
    sortField?: PolicyTransactionSortField;
    sortOrder?: PolicyTransactionSortOrder;
    multiTransactionTypes?: boolean;
}

export interface GetTransactionsSummaryProps {
    endDate?: string; // Zahara API date format (YYYY-MM-DD)
    limit?: number;
    offset?: number;
    planCode: string | undefined;
    policyNumber: string | undefined;
    reverseInitiatorOnly?: boolean;
    sortField?: PolicyTransactionSortField;
    sortOrder?: PolicyTransactionSortOrder;
    startDate?: string; // Zahara API date format (YYYY-MM-DD)
    status?: string[];
    transactionTypes?: string[];
    version?: number;
    year?: string;
}
