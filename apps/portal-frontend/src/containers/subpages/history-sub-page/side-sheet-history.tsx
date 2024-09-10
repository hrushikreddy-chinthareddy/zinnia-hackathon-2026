import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import { removeAllFilters } from '@deps/components/history/filters/filter.helpers';
import TypeFilters from '@deps/components/history/filters/type-filters';
import YearFilter from '@deps/components/history/filters/year-filter';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import SideSheet from '@deps/components/side-sheet/side-sheet';
import { TranslationFiles } from '@deps/config/translations';
import { HistoryFilters, useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';

interface SideSheetHistoryProps {
    isSideSheetOpen: boolean;
    setIsSideSheetOpen: Dispatch<SetStateAction<boolean>>;
}

const SideSheetHistory = ({ isSideSheetOpen, setIsSideSheetOpen }: SideSheetHistoryProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'policy.history.filter' });
    const { historyFilters, setHistoryFilters } = useHistoryFiltersContext();
    const [historyFilterCopy, setHistoryFilterCopy] = useState<HistoryFilters>(historyFilters);

    useEffect(() => {
        if (!isSideSheetOpen) setHistoryFilterCopy(historyFilters);
    }, [historyFilters, isSideSheetOpen]);

    const handleClose = () => {
        setHistoryFilters(historyFilterCopy);
        setIsSideSheetOpen(false);
    };

    const handleApply = () => {
        setIsSideSheetOpen(false);
    };

    const handleClear = () => {
        removeAllFilters(setHistoryFilters);
        setIsSideSheetOpen(false);
    };

    return (
        <SideSheet handleClose={() => handleClose()} header="Filter Events" open={isSideSheetOpen}>
            <div className="flex flex-col gap-10 px-8 pt-8">
                <div className="flex flex-col gap-6">
                    <YearFilter />
                    <TypeFilters />
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={() => handleApply()} size={ButtonSize.Small} type={ButtonType.Primary}>
                        {t('applyFilters')}
                    </Button>
                    <NavElement onClick={() => handleClear()} size={NavElementSize.Small} type={NavElementType.Button}>
                        {t('clearAllFilters')}
                    </NavElement>
                </div>
            </div>
        </SideSheet>
    );
};

export default SideSheetHistory;
