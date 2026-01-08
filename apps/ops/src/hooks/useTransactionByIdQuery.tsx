import { useQuery } from '@tanstack/react-query';

import { getTransactionByIdQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';

export const useTransactionByIdQuery = ({
    transactionId,
    policyNumber,
    planCode,
}: {
    transactionId: string | undefined;
    policyNumber: string | undefined;
    planCode: string | undefined;
}) => {
    return useQuery({
        queryKey: ['transaction', transactionId, policyNumber, planCode],
        queryFn: () =>
            getTransactionByIdQuery({
                transactionId,
                policyNumber,
                planCode,
            }),
        select: (data) => data.data,
    });
};
