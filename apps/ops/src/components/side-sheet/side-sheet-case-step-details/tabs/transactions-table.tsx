import {
    Label,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import { TFunction } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import {
    formatDateForAriaLabel,
    toSentenceCase,
} from '@deps/helpers/string.helpers';

import {
    TransactionActions,
    TransactionActionStatuses,
} from './transactions-step-additional-data.types';

const getTransactionStatus = (
    transactionAction: TransactionActions,
    transactionActionStatus: TransactionActionStatuses,
    t: TFunction
): string => {
    if (transactionActionStatus === TransactionActionStatuses.SUCCESS) {
        if (transactionAction === TransactionActions.DELETE) {
            return t('transactionListing.labels.deleted');
        } else if (transactionAction === TransactionActions.TERMINATE) {
            return t('transactionListing.labels.terminated');
        }
    } else if (transactionActionStatus === TransactionActionStatuses.FAIL) {
        if (transactionAction === TransactionActions.DELETE) {
            return t('transactionListing.labels.deleteFailed');
        } else if (transactionAction === TransactionActions.TERMINATE) {
            return t('transactionListing.labels.terminateFailed');
        }
    }
    return 'None';
};

interface TransactionTableProps {
    t: TFunction;
    transactions: any[] | undefined;
}

export default function TransactionsTable({
    t,
    transactions,
}: TransactionTableProps) {
    const limit = 10;
    const [offset, setOffset] = useState(0);

    const goToPage = useCallback(
        (pageNumber: number) => {
            window.scroll(0, 0);
            setOffset((pageNumber - 1) * limit);
        },
        [setOffset]
    );

    const paginatedRTransactions = useMemo(() => {
        return transactions?.slice(offset, offset + limit);
    }, [offset, limit, transactions]);

    return (
        <div data-testid="transactions-list-container">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell className="!px-3">
                            <Label>
                                {t(
                                    'transactionListing.tableColumns.transaction'
                                )}
                            </Label>
                        </TableHeaderCell>
                        <TableHeaderCell className="!px-3">
                            <Label>
                                {t('transactionListing.tableColumns.status')}
                            </Label>
                        </TableHeaderCell>
                        <TableHeaderCell className="!px-3">
                            <Label>
                                {t('transactionListing.tableColumns.amount')}
                            </Label>
                        </TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody className={clsx('typography-content-body-sm')}>
                    {paginatedRTransactions?.map((transaction, index) => {
                        if (!transaction) return null;
                        const transactionStatus = getTransactionStatus(
                            transaction.action,
                            transaction.actionStatus,
                            t
                        );
                        const terminateDate = transaction.terminateDate
                            ? t('transactionListing.labels.on') +
                              ' ' +
                              formatDateForAriaLabel(
                                  new Date(transaction.terminateDate) || ''
                              )
                            : '-';
                        const amount = numberFormatify(
                            transaction?.amount || 0
                        );
                        return (
                            <TableRow
                                key={`task-${transaction.arrangementId}`}
                                data-testid={`task-${transaction.arrangementId}`}
                            >
                                <TableCell className="typography-content-body-sm !px-3">
                                    <Content
                                        details={toSentenceCase(
                                            transaction.arrangementType
                                        )}
                                        variant={ContentVariant.BodySm}
                                        data-testid={`task-arrangement-type-${index}`}
                                    />
                                    <Content
                                        className="text-[--color-base-text-secondary]"
                                        details={toSentenceCase(
                                            transaction.arrangementId
                                        )}
                                        variant={ContentVariant.BodySm}
                                        data-testid={`task-arrangement-id-${index}`}
                                    />
                                </TableCell>
                                <TableCell className="typography-content-body-sm !px-3">
                                    <Content
                                        details={transactionStatus}
                                        variant={ContentVariant.BodySm}
                                        data-testid={`task-arrangement-status-${index}`}
                                    />
                                    <Content
                                        className="text-[--color-base-text-secondary]"
                                        details={terminateDate}
                                        variant={ContentVariant.BodySm}
                                        data-testid={`task-arrangement-terminate-date-${index}`}
                                    />
                                </TableCell>
                                <TableCell
                                    className="typography-content-body-sm !px-3"
                                    data-testid={`task-amount-${index}`}
                                >
                                    {amount}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            {transactions && transactions?.length > limit && (
                <div className="mx-auto p-2 float-right">
                    <Pagination
                        total={transactions.length}
                        offset={offset}
                        limit={limit}
                        goToPage={goToPage}
                    />
                </div>
            )}
        </div>
    );
}
