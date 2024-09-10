import { useTranslation } from 'next-i18next';
import { Fragment, useCallback, useContext, useEffect, useState } from 'react';

import EventsLoader from '@deps/components/events-loader/events-loader';
import { LabelVariant, labelMapping } from '@deps/components/label/label';
import DividerLabel from '@deps/components/tailwind-components/divider-label';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import {
    EmptyState,
    EventItem,
    Transactions,
    getTransactions,
} from '@deps/containers/subpages/history-sub-page/event-feed/event-feed.helpers';
import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { Transaction } from '@deps/models/policy/sor-policy';

interface EventFeedProps {
    isSideSheetOpen: boolean;
}

export default function EventFeed({ isSideSheetOpen }: EventFeedProps) {
    const { t } = useTranslation();
    const { policy } = useContext(PolicyData);
    const { historyFilters } = useHistoryFiltersContext();
    const [transactions, setTransactions] = useState<Transactions>({ completed: [], upcoming: [] });
    const [isLoading, setIsLoading] = useState(false);

    let completedChildren;
    let upcomingChildren;

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
    
    

    if (transactions.upcoming.length) {
        upcomingChildren = (
            <div className="flex flex-col items-start gap-2 self-stretch">
                <h2 className={labelMapping[LabelVariant.FieldLabel].styles}>{t('policy.history.upcomingEvents')}</h2>
                <ol className="flex flex-col gap-2 self-stretch">
                    {transactions.upcoming.map((transaction: Transaction) => (
                        <EventItem
                            refreshTransactions={fetchTransactions}
                            transaction={transaction}
                            policy={policy}
                            key={`transaction-upcoming-${transaction.correlationId}`}
                        />
                    ))}
                </ol>
            </div>
        );
    }

    if (transactions.completed.length) {
        completedChildren = (
            <div className="flex flex-col items-start gap-2 self-stretch">
                <h2 className={labelMapping[LabelVariant.FieldLabel].styles}>{t('policy.history.completedEvents')}</h2>
                <ol className="flex flex-col gap-2 self-stretch">
                    {transactions.completed.map((transaction: Transaction, index: number) => {
                        const currentYear = transaction.effectiveDate?.slice(0, 4);
                        const lastItemYear = index ? transactions.completed[index - 1].effectiveDate?.slice(0, 4) : currentYear;
                        const cardItem = <EventItem transaction={transaction} policy={policy} refreshTransactions={fetchTransactions} />;

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
            </div>
        );
    } else {
        completedChildren = (
            <div className="flex flex-col items-start gap-2 self-stretch">
                <h2 className={labelMapping[LabelVariant.FieldLabel].styles}>{t('policy.history.completedEvents')}</h2>
                <EmptyState title={t('policy.history.noEventsTitle')} subtitle={t('policy.history.noEventsSubtitle')} />
            </div>
        );
    }

    if (isLoading) {
        return <EventsLoader message={t('policy.history.loadingEvents')} />;
    }

    return (
        <div className="flex h-full flex-1 flex-col gap-4 self-stretch overflow-x-auto pl-2 pr-4 md:pr-6 lg:pr-8">
            {upcomingChildren}
            {completedChildren}
        </div>
    );
}
