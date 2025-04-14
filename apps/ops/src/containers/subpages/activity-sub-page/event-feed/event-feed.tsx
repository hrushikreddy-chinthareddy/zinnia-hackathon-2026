import { useQuery } from '@tanstack/react-query';
import { Pagination } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import EventsLoader from '@deps/components/events-loader/events-loader';
import HistoryEventCard from '@deps/components/history-event-card/history-event-card';
import { LabelVariant, labelMapping } from '@deps/components/label/label';
import DividerLabel from '@deps/components/tailwind-components/divider-label';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { Transaction } from '@deps/models/policy/sor-policy';
import { getTransactionsQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';

import EmptyState from './empty-state';

interface EventFeedProps {
    isSideSheetOpen: boolean;
}

export default function EventFeed({ isSideSheetOpen }: EventFeedProps) {
    const { t } = useTranslation();
    const { policy } = useContext(PolicyData);
    const { historyFilters } = useHistoryFiltersContext();
    const [offset, setOffset] = useState(0);
    const limit = 10;

    const {
        data: transactions,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['getTransactions', historyFilters, policy.policyNumber, policy.product?.planCode],
        queryFn: () => getTransactionsQuery({ historyFilters, policyNumber: policy.policyNumber, planCode: policy.product?.planCode }),
        enabled: !!policy.policyNumber && !!policy.product?.planCode,
    });

    //Pagination go function
    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
        },
        [setOffset]
    );

    // If data updates, go back to page 1
    useEffect(() => {
        goToPage(1);
    }, [goToPage, transactions]);

    // Create paginatedData from transformed data
    const paginatedData = useMemo(() => {
        if (!transactions) return [];
        return transactions.slice(offset, offset + limit);
    }, [offset, limit, transactions]);

    //Refetch when side sheet closes
    useEffect(() => {
        if (!isSideSheetOpen) {
            refetch();
        }
    }, [isSideSheetOpen, refetch]);

    if (isLoading) {
        return <EventsLoader message={t('policy.history.loadingEvents')} />;
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-4 self-stretch pl-2 pr-4 md:pr-6 lg:pr-8">
            <div className="flex flex-col items-start gap-2 self-stretch">
                <h2 className={labelMapping[LabelVariant.FieldLabel].styles}>
                    {t(`policy.history.${(historyFilters.statusFilter ?? 'all').replace(' ', '').toLowerCase()}Events`)}
                </h2>
                {transactions?.length ? (
                    <>
                        <ol className="flex flex-col gap-2 self-stretch">
                            {paginatedData.map((transaction: Transaction, index: number) => {
                                const currentYear = transaction.effectiveDate?.slice(0, 4);
                                const lastItemYear = index ? transactions[index - 1].effectiveDate?.slice(0, 4) : currentYear;
                                const cardItem = (
                                    <HistoryEventCard
                                        key={`transaction-upcoming-${transaction.correlationId}`}
                                        refreshTransactions={refetch}
                                        policy={policy}
                                        transaction={transaction}
                                    />
                                );

                                return (
                                    <Fragment key={`transaction-${transaction.correlationId}-${index}`}>
                                        {currentYear !== lastItemYear && (
                                            <li>
                                                <DividerLabel>
                                                    <Typography variant={TypographyVariant.H3}>{currentYear}</Typography>
                                                </DividerLabel>
                                            </li>
                                        )}
                                        {cardItem}
                                    </Fragment>
                                );
                            })}
                        </ol>
                        <div className="flex self-center my-4">
                            <Pagination limit={limit} offset={offset} total={transactions?.length || 0} goToPage={goToPage} />
                        </div>
                    </>
                ) : (
                    <EmptyState title={t('policy.history.noEventsTitle')} subtitle={t('policy.history.noEventsSubtitle')} />
                )}
            </div>
        </div>
    );
}
