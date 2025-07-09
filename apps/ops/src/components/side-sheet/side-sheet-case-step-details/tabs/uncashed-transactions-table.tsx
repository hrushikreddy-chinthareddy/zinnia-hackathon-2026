import {
    Label,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Badge,
    BadgeVariant,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { TFunction } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    toSentenceCase,
    parseAndFormatDate,
} from '@deps/helpers/string.helpers';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { UncashedTransactionStatus } from './transactions-step-additional-data.types';

const badgeVariant = (status: UncashedTransactionStatus): BadgeVariant => {
    switch (status) {
        case UncashedTransactionStatus.SEND_CHECK_TO_ESTATE:
        case UncashedTransactionStatus.REVERSED:
            return BadgeVariant.SUCCESS;
        case UncashedTransactionStatus.OUTSTANDING:
            return BadgeVariant.WARNING;
        case UncashedTransactionStatus.STOP:
            return BadgeVariant.ERROR;
        default:
            return BadgeVariant.DEFAULT;
    }
};

interface UncashedTransaction {
    id: string;
    checkNumber: string;
    checkIssueDate: string;
    transactionAmount: number;
    policyNumber: string;
    stopTransactionStatus: UncashedTransactionStatus;
}

interface TransactionTableProps {
    t: TFunction;
    transactions: UncashedTransaction[];
}

const getStatusLabelKey = (status: UncashedTransactionStatus): string => {
    switch (status) {
        case UncashedTransactionStatus.OUTSTANDING:
            return 'transactionListing.labels.outstanding';
        case UncashedTransactionStatus.STOP:
            return 'transactionListing.labels.stopped';
        case UncashedTransactionStatus.REVERSED:
            return 'transactionListing.labels.reversed';
        case UncashedTransactionStatus.SEND_CHECK_TO_ESTATE:
            return 'transactionListing.labels.checkToEstate';
        default:
            return 'transactionListing.labels.unknown';
    }
};

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

export default function UncashedTransactionsTable({
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
                            >
                                {t(
                                    'transactionListing.noUncashedTransactionsTableHead',
                                    {
                                        contractNumber: policyNumber,
                                    }
                                )}
                            </Typography>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHeaderCell className="!px-3">
                                            <Label>
                                                {t(
                                                    'transactionListing.tableColumns.checkNo'
                                                )}
                                            </Label>
                                        </TableHeaderCell>
                                        <TableHeaderCell className="!px-3">
                                            <Label>
                                                {t(
                                                    'transactionListing.tableColumns.amount'
                                                )}
                                            </Label>
                                        </TableHeaderCell>
                                        <TableHeaderCell className="!px-3">
                                            <Label>
                                                {t(
                                                    'transactionListing.tableColumns.status'
                                                )}
                                            </Label>
                                        </TableHeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody
                                    className={clsx(
                                        'typography-content-body-sm'
                                    )}
                                >
                                    {paginatedTransactions.map(
                                        (transaction) => (
                                            <TableRow
                                                key={`task-${transaction.id}`}
                                            >
                                                <TableCell className="typography-content-body-sm !px-3">
                                                    <Content
                                                        details={toSentenceCase(
                                                            `#${transaction.checkNumber}`
                                                        )}
                                                        variant={
                                                            ContentVariant.BodySm
                                                        }
                                                    />
                                                    <Content
                                                        className="text-[--color-base-text-text-secondary]"
                                                        details={
                                                            parseAndFormatDate(
                                                                ZAHARA_API_DATE_FORMAT,
                                                                'MMM DD, YYYY',
                                                                transaction.checkIssueDate
                                                            ) as string
                                                        }
                                                        variant={
                                                            ContentVariant.BodySm
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell className="typography-content-body-sm !px-3">
                                                    {numberFormatify(
                                                        transaction.transactionAmount
                                                    )}
                                                </TableCell>
                                                <TableCell className="typography-content-body-sm !px-3">
                                                    <Badge
                                                        label={t(
                                                            getStatusLabelKey(
                                                                transaction.stopTransactionStatus
                                                            )
                                                        )}
                                                        variant={badgeVariant(
                                                            transaction.stopTransactionStatus
                                                        )}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                            {contractTransactions.length > limit && (
                                <div className="mx-auto p-2  max-w-[300px]">
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
