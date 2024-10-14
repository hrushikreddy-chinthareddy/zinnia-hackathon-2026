import { useEffect, useState } from 'react';

import { SortOrder, Transaction, TransactionStatus } from '@deps/models/case/withdrawal/case';
import { getPolicyTransactionHistory } from '@deps/queries/api/policies';

export enum TypeDesc {
    Withdrawal = 'Withdrawal',
}

export enum TransactionType {
    Withdrawals = 'WITHDRAWALS',
}

type TransactionsHistoryProps = {
    contract: string;
    clientId: string;
    typeDesc: TypeDesc;
    transactionType: TransactionType;
    fromDate: string;
    filter?: {
        count: number;
        statuses: TransactionStatus[];
        sortBy: SortOrder;
    };
};

export const useTransactionsHistory = ({ contract, clientId, typeDesc, transactionType, fromDate, filter }: TransactionsHistoryProps) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [apiError, setApiError] = useState<string>('');
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        const statusFilter = (transaction: Transaction) => filter?.statuses.includes(transaction.Status);

        setApiError('');
        const getTransactions = async () => {
            try {
                setLoader(true);
                const data = await getPolicyTransactionHistory(contract, clientId, typeDesc, transactionType, fromDate);
                if (data?.Items) {
                    const filteredTransactions = filter ? data?.Items?.filter(statusFilter) : data?.Items;
                    const transactions = filteredTransactions
                        .sort((a, b) =>
                            filter?.sortBy === SortOrder.Asc
                                ? a.TransactionDate.localeCompare(b.TransactionDate)
                                : b.TransactionDate.localeCompare(a.TransactionDate)
                        )
                        .slice(0, filter?.count ?? 5);
                    setTransactions(transactions);
                    setLoader(false);
                }
            } catch (e: any) {
                setLoader(false);
                setApiError(e?.message as string);
                console.error('TransactionHistory::Error retrieving transaction history', e);
            }
        };

        getTransactions();
    }, [contract, clientId, typeDesc, transactionType, fromDate]);

    return { transactions, apiError, loader };
};
