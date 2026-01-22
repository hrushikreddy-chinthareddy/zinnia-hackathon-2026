import dayjs from 'dayjs';
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { CustomDateRange } from '@deps/components/dashboard/filters/time-filter/custom-date-range';
import EventsLoader from '@deps/components/events-loader/events-loader';
import { FindAllKeyValuesTransactionSidesheet } from '@deps/components/find-key-values-sidesheet/find-all-key-values-transaction-sidesheet';
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
import { DEFAULT_DATE_DISPLAY_FORMAT } from '@deps/types/constants';
import { TransactionSummary } from '@deps/types/transactions';
import { TransactionStatus } from '@zinnia/api-types/types/sor';

import styles from './transaction-wrapper.module.css';
import { TransactionsTable } from './transactions-table';

export const TransactionsWrapper = () => {
    const { t } = useTranslation();
    const { policy } = useContext(PolicyData);
    const { historyFilters, setHistoryFilters } = useHistoryFiltersContext();
    const { statusFilter = TransactionStatus.COMPLETED } = historyFilters;
    const [offset, setOffset] = useState(0);
    const limit = 25;
    const previousHistory = useRef(historyFilters);
    const selectedDateRange = {
        from:
            historyFilters?.datesFilter?.from.format(
                DEFAULT_DATE_DISPLAY_FORMAT
            ) ??
            dayjs().subtract(1, 'year').format(DEFAULT_DATE_DISPLAY_FORMAT),
        to:
            historyFilters?.datesFilter?.to.format(
                DEFAULT_DATE_DISPLAY_FORMAT
            ) ??
            dayjs()
                .add(1, 'month')
                .endOf('month')
                .format(DEFAULT_DATE_DISPLAY_FORMAT),
    };
    const {
        data: filteredTransactions = initialFilterTransactions,
        isLoading,
        refetch,
    } = useTransactions(
        policy,
        {
            ...historyFilters,
            datesFilter: {
                from: dayjs(selectedDateRange.from).utc(),
                to: dayjs(selectedDateRange.to).utc(),
            },
        },
        historyFilters?.transactionTypes
    );

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [setOffset]
    );

    useEffect(() => {
        if (previousHistory.current !== historyFilters) {
            goToPage(1);
        }
    }, [previousHistory, historyFilters, goToPage]);

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
            return t('allFields.noTransactionsTitle', {
                status: statusFilter.toLocaleLowerCase(),
            });
        }
    }, [filteredTransactions, limit, t, statusFilter]);

    const [selectedTransaction, setSelectedTransaction] =
        useState<TransactionSummary>({});

    const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);
    const prevActiveElement = useRef<HTMLElement | null>(null);

    const onTransactionSubmit = useCallback(() => {
        refetch();
        setIsSideSheetOpen(false);
    }, [refetch, setIsSideSheetOpen]);

    useEffect(() => {
        // Restore focus to row on sidesheet close
        if (!isSideSheetOpen) {
            prevActiveElement.current?.focus();
        }
    }, [isSideSheetOpen]);

    const handleRowClick = (transaction: TransactionSummary) => {
        if (transaction) {
            setSelectedTransaction(transaction);
            prevActiveElement.current = document.activeElement as HTMLElement;
            setIsSideSheetOpen(!isSideSheetOpen);
        }
    };

    return (
        <div className={styles.transactionWrapper}>
            <PageHeader
                headerText={t('pageHeader.transactions.headerText') || ''}
            />
            <div className={styles.filters}>
                <TransactionTypeSelect />
                <CustomDateRange
                    handleTimerangeChange={(dates) =>
                        setHistoryFilters((prevState) => ({
                            ...prevState,
                            datesFilter: {
                                from: dayjs(dates.from).utc(),
                                to: dayjs(dates.to).utc(),
                            },
                        }))
                    }
                    timerange={selectedDateRange}
                    disableFutureDates={false}
                />
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
                            onTableRowClick={handleRowClick}
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
                    <FindAllKeyValuesTransactionSidesheet
                        policyNumber={policy?.policyNumber}
                        planCode={policy?.product?.planCode}
                        transactionId={selectedTransaction.transactionId}
                        transactionType={selectedTransaction.transactionType}
                        open={isSideSheetOpen}
                        onOpenChange={setIsSideSheetOpen}
                        onTransactionSubmit={onTransactionSubmit}
                    />
                </>
            ) : (
                <EventsLoader message={t('allFields.loadingTransactions')} />
            )}
        </div>
    );
};
