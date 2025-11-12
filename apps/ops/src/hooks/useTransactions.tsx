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
    enabled: boolean = true
) =>
    queryOptions({
        queryKey: [
            'getTransactions',
            historyFilters.eventFilter,
            policy.policyNumber,
            policy.product?.planCode,
        ],
        queryFn: () =>
            getTransactionsQuery({
                historyFilters: { eventFilter: historyFilters.eventFilter },
                policyNumber: policy.policyNumber,
                planCode: policy.product?.planCode,
            }),
        enabled: enabled && !!policy.policyNumber && !!policy.product?.planCode,
        select: (results) => filteredTransactions(results),
    });

export const useTransactions = (
    policy: BasePolicy,
    historyFilters: HistoryFilters,
    enabled?: boolean
) => {
    return useQuery({
        ...useTransactionsOptions(historyFilters, policy, enabled),
    });
};
