import { queryOptions, useQuery } from '@tanstack/react-query';
import {
    BasePolicy,
    Transaction,
    TransactionStatus,
} from '@xd/api-types/dist/generated-types/sor';

import { HistoryFilters } from '@deps/contexts/HistoryFiltersContext';
import { getTransactionsQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';

export const initialFilterTransactions: { [key: string]: Transaction[] } = {
    [TransactionStatus.COMPLETED]: [],
    [TransactionStatus.PENDING]: [],
    [TransactionStatus.CANCELED]: [],
    [TransactionStatus.FAILED]: [],
    [TransactionStatus.REVERSED]: [],
};

const filteredTransactions = (transactions: Transaction[]) => {
    return (
        transactions?.reduce((acc, transaction) => {
            for (const status in acc) {
                if (status === transaction.status) {
                    acc = {
                        ...acc,
                        [status]: [...acc[status], transaction],
                    };
                }
            }
            return acc;
        }, initialFilterTransactions) ?? initialFilterTransactions
    );
};

export const useTransactionsOptions = (
    historyFilters: HistoryFilters,
    policy: BasePolicy,
    multiTransactionTypes?: boolean,
    enabled: boolean = true
) => {
    return queryOptions({
        queryKey: [
            'getTransactions',
            historyFilters.eventFilter,
            historyFilters.datesFilter,
            policy.policyNumber,
            policy.product?.planCode,
            multiTransactionTypes,
        ],

        queryFn: () =>
            getTransactionsQuery({
                historyFilters: {
                    eventFilter: historyFilters.eventFilter,
                    datesFilter: historyFilters.datesFilter,
                },
                policyNumber: policy.policyNumber,
                planCode: policy.product?.planCode,
                multiTransactionTypes,
            }),
        enabled: enabled && !!policy.policyNumber && !!policy.product?.planCode,
        select: (results) => filteredTransactions(results),
    });
};

export const useTransactions = (
    policy: BasePolicy,
    historyFilters: HistoryFilters,
    multiTransactionTypes: boolean = false,
    enabled?: boolean
) => {
    return useQuery({
        ...useTransactionsOptions(
            historyFilters,
            policy,
            multiTransactionTypes,
            enabled
        ),
    });
};
