import { Pagination } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

import { UncashedTransactionStatus } from '../transactions-step-additional-data.types';
import UncashedTransactionCard from './uncashed-transaction-card';

export interface UncashedTransaction {
    id: string;
    checkNumber: string;
    checkIssueDate: string;
    transactionAmount: number;
    transactionDate: string;
    transactionNumber: string;
    policyNumber: string;
    stopTransactionStatus: UncashedTransactionStatus;
    postFund?: boolean;
}

interface TransactionTableProps {
    t: TFunction;
    transactions: UncashedTransaction[];
}

const groupTransactionsByContract = (transactions: UncashedTransaction[]) => {
    return transactions.reduce((acc, transaction) => {
        const policyNumber = transaction.policyNumber || 'Unknown';
        if (!acc[policyNumber]) {
            acc[policyNumber] = [];
        }
        acc[policyNumber].push(transaction);
        return acc;
    }, {} as Record<string, UncashedTransaction[]>);
};

export default function UncashedChecks({
    t,
    transactions,
}: TransactionTableProps) {
    const limit = 10;
    const [offsets, setOffsets] = useState<Record<string, number>>({});

    const goToPage = useCallback(
        (policyNumber: string, pageNumber: number) => {
            window.scroll(0, 0);
            setOffsets((prev) => ({
                ...prev,
                [policyNumber]: (pageNumber - 1) * limit,
            }));
        },
        [limit]
    );

    const groupedTransactions = useMemo(() => {
        if (!transactions) return {};
        return groupTransactionsByContract(transactions);
    }, [transactions]);

    if (!transactions || transactions.length === 0) {
        return (
            <div data-testid="transactions-list-container">
                <p>{t('transactionListing.noUncashedTransactions')}</p>
            </div>
        );
    }

    return (
        <div data-testid="transactions-list-container">
            {Object.entries(groupedTransactions).map(
                ([policyNumber, contractTransactions]) => {
                    const offset = offsets[policyNumber] || 0;
                    const paginatedTransactions = [...contractTransactions]
                        .sort((a, b) => {
                            const dateA = new Date(a.checkIssueDate);
                            const dateB = new Date(b.checkIssueDate);
                            return dateB.getTime() - dateA.getTime();
                        })
                        .slice(offset, offset + limit);

                    return (
                        <div key={policyNumber} className="mb-8">
                            <Typography
                                variant={TypographyVariant.H4}
                                className="mb-4"
                                data-testid={`contract-heading-${policyNumber}`}
                            >
                                <PiiWrapper>
                                    {t(
                                        'transactionListing.contractNumberHeading',
                                        {
                                            contractNumber: policyNumber,
                                        }
                                    )}
                                </PiiWrapper>
                            </Typography>

                            <div>
                                {paginatedTransactions.map((transaction) => (
                                    <UncashedTransactionCard
                                        key={`uncashed-transaction-card-${transaction.id}`}
                                        transaction={transaction}
                                        t={t}
                                    />
                                ))}
                            </div>
                            {contractTransactions.length > limit && (
                                <div
                                    className="mx-auto p-2  max-w-[300px]"
                                    data-testid="trans-pagination"
                                >
                                    <Pagination
                                        total={contractTransactions.length}
                                        offset={offset}
                                        limit={limit}
                                        goToPage={(pageNumber) =>
                                            goToPage(policyNumber, pageNumber)
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    );
                }
            )}
        </div>
    );
}
