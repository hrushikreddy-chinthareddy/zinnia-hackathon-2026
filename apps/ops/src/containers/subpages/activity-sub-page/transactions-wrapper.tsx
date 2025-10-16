import { TransactionStatus } from '@xd/api-types/dist/generated-types/sor';
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import EventsLoader from '@deps/components/events-loader/events-loader';
import { TransactionStatusTabGroup } from '@deps/components/history/filters/transaction-status-tab-group';
import { TransactionTypeSelect } from '@deps/components/history/filters/transaction-type-select';
import PageHeader from '@deps/components/page-header/page-header';
import PaginationControls from '@deps/components/pagination/pagination';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import {
    initialFilterTransactions,
    useTransactions,
} from '@deps/hooks/useTransactions';

import styles from './transaction-wrapper.module.css';
import { TransactionsTable } from './transactions-table';

const initialFilterTransactions = {
    [TransactionStatus.COMPLETED]: [],
    [TransactionStatus.PENDING]: [],
    [TransactionStatus.CANCELED]: [],
    [TransactionStatus.FAILED]: [],
    [TransactionStatus.REVERSED]: [],
};

export const TransactionsWrapper = () => {
    const { t } = useTranslation();
    const { policy } = useContext(PolicyData);
    const { historyFilters } = useHistoryFiltersContext();
    const { statusFilter = TransactionStatus.COMPLETED } = historyFilters;
    const [offset, setOffset] = useState(0);
    const limit = 25;
    const previousStatus = useRef(statusFilter);
    const {
        data: filteredTransactions = initialFilterTransactions,
        isLoading,
    } = useTransactions(policy, historyFilters);

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [setOffset]
    );

    useEffect(() => {
        if (previousStatus.current !== statusFilter) {
            goToPage(1);
        }
    }, [previousStatus, statusFilter, goToPage]);

    const liveResultsMessage = useMemo(() => {
        if (filteredTransactions?.length) {
            return t('policy.documents.xToYOfZ', {
                x: filteredTransactions?.[statusFilter].length + 1,
                y: Math.min(
                    filteredTransactions?.[statusFilter].length + limit,
                    filteredTransactions?.[statusFilter].length || 0
                ),
                z: `${filteredTransactions?.[statusFilter].length ?? '0'}${
                    filteredTransactions?.[statusFilter].length === 10000
                        ? '+'
                        : ''
                }`,
            });
        } else {
            return t('policy.history.noTransactionsTitle', {
                status: statusFilter.toLocaleLowerCase(),
            });
        }
    }, [filteredTransactions, limit, t, statusFilter]);

    useEffect(() => {
        if (previousStatus.current !== statusFilter) {
            goToPage(1);
        }
    }, [previousStatus, statusFilter, goToPage]);

    return (
        <div className={styles.transactionWrapper}>
            <PageHeader
                headerText={t('pageHeader.transactions.headerText') || ''}
            />
            <div className={styles.typeSelect}>
                <div className="flex w-full flex-col">
                    <TransactionTypeSelect />
                </div>
            </div>
            <div aria-live="polite" aria-atomic="true" className="sr-only">
                {liveResultsMessage}
            </div>
            {!isLoading ? (
                <>
                    <TransactionStatusTabGroup
                        transactions={filteredTransactions}
                    >
                        <TransactionsTable
                            transactions={filteredTransactions[statusFilter]}
                            status={statusFilter}
                            offset={offset}
                            limit={limit}
                        />
                        <div className={styles.tableFooter}>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className={`mb-6 lg:mb-0 ${
                                    (filteredTransactions?.[statusFilter]
                                        .length || 0) < 1
                                        ? 'hidden'
                                        : ''
                                }`}
                            >
                                {t('policy.documents.xToYOfZ', {
                                    x: offset + 1,
                                    y: Math.min(
                                        offset + limit,
                                        filteredTransactions?.[statusFilter]
                                            .length || 0
                                    ),
                                    z: `${
                                        filteredTransactions?.[
                                            statusFilter
                                        ].length.toLocaleString() ?? '0'
                                    }${
                                        filteredTransactions?.[statusFilter]
                                            .length === 10000
                                            ? '+'
                                            : ''
                                    }`,
                                })}
                            </Typography>
                            <PaginationControls
                                limit={limit}
                                offset={offset}
                                total={
                                    filteredTransactions?.[statusFilter]
                                        .length || 0
                                }
                                goToPage={goToPage}
                            />
                        </div>
                    </TransactionStatusTabGroup>
                </>
            ) : (
                <EventsLoader
                    message={t('policy.history.loadingTransactions')}
                />
            )}
        </div>
    );
};
