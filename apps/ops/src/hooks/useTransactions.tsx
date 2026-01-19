import { useQuery } from '@tanstack/react-query';

import { buildTransactionApiArgsFromFilters } from '@deps/components/history/filters/filter.helpers';
import { HistoryFilters } from '@deps/contexts/HistoryFiltersContext';
import { getTransactionsSummaryQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { TransactionSummary } from '@deps/types/transactions';
import { BasePolicy, TransactionStatus } from '@zinnia/api-types/types/sor';

export const initialFilterTransactions: {
    [key: string]: TransactionSummary[];
} = {
    [TransactionStatus.COMPLETED]: [],
    [TransactionStatus.PENDING]: [],
    [TransactionStatus.CANCELED]: [],
    [TransactionStatus.FAILED]: [],
    [TransactionStatus.REVERSED]: [],
};

const filteredTransactions = (transactions: TransactionSummary[]) => {
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

export const useTransactions = (
    policy: BasePolicy,
    historyFilters: HistoryFilters,
    transactionTypes: string[] | undefined,
    enabled?: boolean
) => {
    return useQuery({
        queryKey: [
            'getTransactions',
            historyFilters,
            policy.policyNumber,
            policy.product?.planCode,
            transactionTypes,
        ],

        queryFn: () => {
            const args = buildTransactionApiArgsFromFilters(historyFilters);
            return getTransactionsSummaryQuery({
                ...args,
                policyNumber: policy.policyNumber,
                planCode: policy.product?.planCode,
                transactionTypes,
            });
        },
        enabled: enabled && !!policy.policyNumber && !!policy.product?.planCode,
        select: (results) => filteredTransactions(results),
    });
};
