import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';

import ActiveChip from './active-chip';

type TaskManagerAdditionalFilters = {
    carriers: string[];
    queues: string[];
    statuses: string[];
};

const Clear = ({ onReset }: { onReset: () => void }) => {
    const { t } = useTranslation();
    return (
        <NavElement
            type={NavElementType.Button}
            className="flex self-center whitespace-nowrap"
            onClick={onReset}
        >
            {t('caseManagementDashboard.refineResultsOptions.clearAll')}
        </NavElement>
    );
};

export interface ActiveFiltersProps {
    filters: TaskManagerAdditionalFilters;
    removeFilter: (filterName: string, filterToRemove: string) => void;
    onReset: () => void;
    authorizedCarriers: string[];
}

export default function TaskManagerActiveFilters({
    filters,
    removeFilter,
    onReset,
    authorizedCarriers,
}: ActiveFiltersProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseManagementDashboard.refineResultsFilters',
    });

    const [filtersActive, setFiltersActive] = useState(false);

    const { carriers, statuses, queues } = filters || {};

    useEffect(() => {
        if (carriers?.length || queues?.length || statuses?.length) {
            setFiltersActive(true);
        } else {
            setFiltersActive(false);
        }
    }, [carriers, statuses, queues]);

    if (!filtersActive) return null;

    return (
        <div className="mb-6 mt-4 flex max-w-full flex-row flex-wrap items-center justify-start gap-2">
            {(
                filters &&
                (Object.entries(filters) as [
                    keyof TaskManagerAdditionalFilters,
                    string[]
                ][])
            ).map(([filterKey, filterValues]) =>
                filterValues.map((filterItem) => (
                    <ActiveChip
                        codeList={authorizedCarriers}
                        key={`${filterKey}-filter-${filterItem}`}
                        code={filterItem}
                        allCodes={Object.fromEntries(
                            filterValues.map((item) => [item, item])
                        )}
                        handleRemoveFilter={() => {
                            removeFilter(filterKey, filterItem);
                        }}
                        t={t}
                    />
                ))
            )}
            <Clear onReset={onReset} />
        </div>
    );
}
