import { Transaction } from '@xd/api-types/dist/generated-types/sor';
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
import { TranslationFiles } from '@deps/config/translations';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';

import styles from './transaction-wrapper.module.css';

export const TransactionsTable = ({
    transactions,
    status,
    offset,
    limit,
}: {
    transactions?: Transaction[];
    status: string;
    offset: number;
    limit: number;
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: undefined,
    });
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
                            {paginatedData.map((transaction) => (
                                <TableRow key={transaction.transactionId}>
                                    <TableCell>
                                        {t(
                                            `historyEventCard.transactionTypes.${transaction.transactionType}`
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
                                            transaction.transactionAmounts
                                                ?.requestedAmount,
                                            currencyFormat
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {numberFormatify(
                                            transaction.transactionAmounts
                                                ?.appliedAmount,
                                            currencyFormat
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </>
                    ) : (
                        <TableCell className={styles.noResultsTd} colSpan={100}>
                            <Typography variant={TypographyVariant.Body}>
                                {t('policy.history.noTransactionsTitle', {
                                    status: status.toLocaleLowerCase(),
                                })}
                            </Typography>
                        </TableCell>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
