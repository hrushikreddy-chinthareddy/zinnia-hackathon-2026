import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@zinnia/bloom/components';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { TransactionSummary } from '@deps/types/transactions';

import styles from './transaction-wrapper.module.css';

export const TransactionsTable = ({
    transactions,
    status,
    offset,
    limit,
    onTableRowClick,
}: {
    transactions?: TransactionSummary[];
    status: string;
    offset: number;
    limit: number;
    onTableRowClick: (transaction: TransactionSummary) => void;
}) => {
    const { t } = useTranslation();
    const currencyFormat: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'USD',
    };

    const paginatedData = useMemo(() => {
        if (!transactions) return [];
        return transactions.slice(offset, offset + limit);
    }, [offset, limit, transactions]);

    return (
        <div className={styles.table}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell className="typography-content-body-sm-bold">
                            {t('historyEventCard.transactionType')}
                        </TableHeaderCell>
                        <TableHeaderCell className="typography-content-body-sm-bold">
                            {t('historyEventCard.requestDate')}
                        </TableHeaderCell>
                        <TableHeaderCell className="typography-content-body-sm-bold">
                            {t('historyEventCard.processDate')}
                        </TableHeaderCell>
                        <TableHeaderCell className="typography-content-body-sm-bold">
                            {t('historyEventCard.effectiveDate')}
                        </TableHeaderCell>
                        <TableHeaderCell className="typography-content-body-sm-bold">
                            {t('historyEventCard.requestedAmount')}
                        </TableHeaderCell>
                        <TableHeaderCell className="typography-content-body-sm-bold">
                            {t('historyEventCard.appliedAmount')}
                        </TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData.length ? (
                        <>
                            {paginatedData.map((transaction, index) => (
                                <TableRow
                                    tabIndex={0}
                                    key={`${transaction.transactionId}-${index}`}
                                    onClick={() => onTableRowClick(transaction)}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' ||
                                            e.key === ' '
                                        ) {
                                            e.preventDefault();
                                            onTableRowClick(transaction);
                                        }
                                    }}
                                >
                                    <TableCell>
                                        {t(
                                            `enums.${transaction.transactionType}`,
                                            transaction.transactionType ?? ''
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {convertKebabedDateString(
                                            transaction.requestDate
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {convertKebabedDateString(
                                            transaction.processDate
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {convertKebabedDateString(
                                            transaction.effectiveDate
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {numberFormatify(
                                            transaction?.requestedAmount,
                                            currencyFormat
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {numberFormatify(
                                            transaction?.appliedAmount,
                                            currencyFormat
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </>
                    ) : (
                        <TableRow>
                            <TableCell
                                className={styles.noResultsTd}
                                colSpan={100}
                            >
                                <Typography variant={TypographyVariant.Body}>
                                    {t('allFields.noTransactionsTitle', {
                                        status: status.toLocaleLowerCase(),
                                    })}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
