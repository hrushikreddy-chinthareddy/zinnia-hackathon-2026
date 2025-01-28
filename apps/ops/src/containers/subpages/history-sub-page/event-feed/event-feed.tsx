import { useTranslation } from 'next-i18next';
import { Fragment, useCallback, useContext, useEffect, useState } from 'react';

import EventsLoader from '@deps/components/events-loader/events-loader';
import HistoryEventCard from '@deps/components/history-event-card/history-event-card';
import { LabelVariant, labelMapping } from '@deps/components/label/label';
import DividerLabel from '@deps/components/tailwind-components/divider-label';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { getTransactions } from '@deps/containers/subpages/history-sub-page/event-feed/event-feed.helpers';
import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { Transaction } from '@deps/models/policy/sor-policy';

import EmptyState from './empty-state';

interface EventFeedProps {
    isSideSheetOpen: boolean;
}

export default function EventFeed({ isSideSheetOpen }: EventFeedProps) {
    const { t } = useTranslation();
    const { policy } = useContext(PolicyData);
    const { historyFilters } = useHistoryFiltersContext();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTransactions = useCallback(() => {
        if (isLoading) {
            return;
        }

        getTransactions({ historyFilters, policy, setIsLoading, setTransactions });
    }, [historyFilters, policy, setIsLoading, setTransactions, isLoading]);

    useEffect(() => {
        if (!isSideSheetOpen) {
            fetchTransactions();
        }
    }, [historyFilters, isSideSheetOpen, policy]);

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
                    <ol className="flex flex-col gap-2 self-stretch">
                        {transactions.map((transaction: Transaction, index: number) => {
                            const currentYear = transaction.effectiveDate?.slice(0, 4);
                            const lastItemYear = index ? transactions[index - 1].effectiveDate?.slice(0, 4) : currentYear;
                            const cardItem = (
                                <HistoryEventCard
                                    key={`transaction-upcoming-${transaction.correlationId}`}
                                    refreshTransactions={fetchTransactions}
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
                ) : (
                    <EmptyState title={t('policy.history.noEventsTitle')} subtitle={t('policy.history.noEventsSubtitle')} />
                )}
            </div>
        </div>
    );
}
