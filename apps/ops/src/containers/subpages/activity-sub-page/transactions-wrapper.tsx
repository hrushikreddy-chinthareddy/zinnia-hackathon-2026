import { Toggle } from '@zinnia/bloom/components';
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
import {
    TransactionTypeEnum,
    TransactionStatus,
} from '@zinnia/api-types/types/sor';

import styles from './transaction-wrapper.module.css';
import { TransactionsTable } from './transactions-table';

export const TransactionsWrapper = () => {
    const { t } = useTranslation();
    const { policy } = useContext(PolicyData);
    const { historyFilters, setHistoryFilters } = useHistoryFiltersContext();
    const { statusFilter = TransactionStatus.COMPLETED } = historyFilters;
    const [offset, setOffset] = useState(0);
    const [hideDailyInterest, setHideDailyInterest] = useState(false);
    const limit = 25;
    const previousHistory = useRef(historyFilters);
    const INTEREST_CREDIT_TYPE = TransactionTypeEnum.INTEREST_CREDIT;

    const selectedDateRange = useMemo(
        () => ({
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
        }),
        [historyFilters?.datesFilter]
    );
    // Only include date-related filters so the query key is stable across type/tab/toggle changes
    const dateOnlyFilters = useMemo(
        () => ({
            datesFilter: {
                from: dayjs(selectedDateRange.from).utc(),
                to: dayjs(selectedDateRange.to).utc(),
            },
        }),
        [selectedDateRange]
    );

    // Single query — fetches all transactions for the date range
    const {
        data: allTransactions = initialFilterTransactions,
        isLoading,
        refetch,
    } = useTransactions(policy, dateOnlyFilters, undefined, true);

    // Client-side filtering by selected transaction types
    const filteredTransactions = useMemo(() => {
        const selectedTypes = historyFilters?.transactionTypes;
        if (!selectedTypes?.length) {
            return allTransactions;
        }
        return Object.entries(allTransactions).reduce(
            (acc, [status, txns]) => ({
                ...acc,
                [status]: txns.filter((txn) =>
                    selectedTypes.includes(txn.transactionType ?? '')
                ),
            }),
            {} as typeof allTransactions
        );
    }, [allTransactions, historyFilters?.transactionTypes]);

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

    // Reset pagination when toggle changes
    useEffect(() => {
        goToPage(1);
    }, [hideDailyInterest, goToPage]);

    // Apply the toggle filter directly to filteredTransactions so tab counts and table stay in sync
    const filteredWithToggle = useMemo(() => {
        if (!hideDailyInterest) {
            return filteredTransactions;
        }
        return Object.keys(filteredTransactions).reduce(
            (acc, status) => ({
                ...acc,
                [status]: (filteredTransactions[status] ?? []).filter(
                    (txn) => txn.transactionType !== INTEREST_CREDIT_TYPE
                ),
            }),
            {} as typeof filteredTransactions
        );
    }, [filteredTransactions, hideDailyInterest, INTEREST_CREDIT_TYPE]);

    const currentTabFilteredTransactions = useMemo(
        () => filteredWithToggle[statusFilter] ?? [],
        [filteredWithToggle, statusFilter]
    );

    const liveResultsMessage = useMemo(() => {
        if (currentTabFilteredTransactions.length) {
            return t('policy.documents.xToYOfZ', {
                x: offset + 1,
                y: Math.min(
                    offset + limit,
                    currentTabFilteredTransactions.length
                ),
                z: `${currentTabFilteredTransactions.length ?? '0'}${
                    currentTabFilteredTransactions.length === 10000 ? '+' : ''
                }`,
            });
        } else {
            return t('allFields.noTransactionsTitle', {
                status: statusFilter.toLocaleLowerCase(),
            });
        }
    }, [currentTabFilteredTransactions, offset, limit, t, statusFilter]);

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
                <div className={styles.filterGroup}>
                    <TransactionTypeSelect />
                    <Toggle
                        labelId="hide-daily-interest-toggle"
                        text={t('allFields.hideDailyInterest') || ''}
                        pressed={hideDailyInterest}
                        onClick={() => setHideDailyInterest((prev) => !prev)}
                    />
                </div>
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
                        transactions={filteredWithToggle}
                    >
                        <TransactionsTable
                            transactions={currentTabFilteredTransactions}
                            status={statusFilter}
                            offset={offset}
                            limit={limit}
                            onTableRowClick={handleRowClick}
                        />
                        <div className={styles.tableFooter}>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className={`mb-6 lg:mb-0 ${
                                    currentTabFilteredTransactions.length < 1
                                        ? 'hidden'
                                        : ''
                                }`}
                            >
                                {t('policy.documents.xToYOfZ', {
                                    x: offset + 1,
                                    y: Math.min(
                                        offset + limit,
                                        currentTabFilteredTransactions.length
                                    ),
                                    z: `${
                                        currentTabFilteredTransactions.length.toLocaleString() ??
                                        '0'
                                    }${
                                        currentTabFilteredTransactions.length ===
                                        10000
                                            ? '+'
                                            : ''
                                    }`,
                                })}
                            </Typography>
                            <PaginationControls
                                limit={limit}
                                offset={offset}
                                total={currentTabFilteredTransactions.length}
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
