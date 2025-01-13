import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import TransactionStatusFilter from '@deps/components/history/filters/status-filter';
import TypeFilters, { DismissableFilters } from '@deps/components/history/filters/type-filters';
import YearFilter from '@deps/components/history/filters/year-filter';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import ActivityPageHeader from '@deps/containers/page-header/activity-page-header';
import SideSheetHistory from '@deps/containers/subpages/activity-sub-page/side-sheet-history';
import { HistoryFiltersProvider } from '@deps/contexts/HistoryFiltersContext';
import { ReactComponent as FilterIcon } from '@deps/styles/elements/icons/icons_outlined/filter.svg';

import HistoryEventFeed from './event-feed/event-feed';

const ActivitySubPage = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'policy.history.filter' });
    const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);

    return (
        <HistoryFiltersProvider>
            <div className="flex h-full flex-col items-start rounded bg-white">
                <ActivityPageHeader />
                <div className="responsive-padding flex grow basis-[350px] flex-col items-start gap-4 self-stretch overflow-auto !pr-0 lg:flex-row lg:gap-8">
                    <NavElement
                        className="flex h-6 items-center gap-1 leading-6 lg:hidden"
                        onClick={() => setIsSideSheetOpen(true)}
                        onKeyDown={(e: { key: string }) => {
                            if (e.key === 'Enter' || e.key === ' ') setIsSideSheetOpen(true);
                        }}
                        size={NavElementSize.Small}
                        startIcon={<FilterIcon height={16} width={16} />}
                        type={NavElementType.Button}
                    >
                        {t('filterEvents')}
                    </NavElement>
                    <DismissableFilters isSideSheetOpen={isSideSheetOpen} />

                    <div className="hidden w-[200px] flex-shrink-0 flex-col items-start gap-6 lg:flex">
                        <TransactionStatusFilter />
                        <YearFilter />
                        <TypeFilters />
                    </div>
                    <HistoryEventFeed isSideSheetOpen={isSideSheetOpen} />
                </div>

                <SideSheetHistory isSideSheetOpen={isSideSheetOpen} setIsSideSheetOpen={setIsSideSheetOpen} />
            </div>
        </HistoryFiltersProvider>
    );
};

export default ActivitySubPage;
