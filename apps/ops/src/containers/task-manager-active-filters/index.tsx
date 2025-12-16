import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { FilterKeys } from '@deps/models/case/task';

import ActiveChip from './active-chip';

type TaskManagerAdditionalFilters = {
    carriers: string[];
    queues: string[];
    statuses: string[];
    escalated: boolean | null;
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

    const {
        carriers = [],
        statuses = [],
        queues = [],
        escalated = undefined,
    } = filters || {};

    useEffect(() => {
        if (
            carriers?.length ||
            queues?.length ||
            statuses?.length ||
            escalated !== undefined
        ) {
            setFiltersActive(true);
        } else {
            setFiltersActive(false);
        }
    }, [carriers, statuses, queues, escalated]);

    if (!filtersActive) return null;
    const getEscalatedDisplayInfo = (value: boolean | null) => {
        if (value === true) {
            return {
                displayCode: t('escalated.onlyPrioritized'),
            };
        } else if (value === false) {
            return {
                displayCode: t('escalated.notPrioritized'),
            };
        } else {
            return {
                displayCode: t('escalated.allCases'),
            };
        }
    };

    return (
        <div className="mb-6 mt-4 flex max-w-full flex-row flex-wrap items-center justify-start gap-2">
            {escalated !== undefined && (
                <ActiveChip
                    key="escalated-filter"
                    code={getEscalatedDisplayInfo(escalated).displayCode}
                    allCodes={{
                        [getEscalatedDisplayInfo(escalated).displayCode]:
                            getEscalatedDisplayInfo(escalated).displayCode,
                    }}
                    handleRemoveFilter={() => {
                        removeFilter(FilterKeys.escalated, 'any');
                    }}
                    t={t}
                />
            )}

            {filters &&
                ([FilterKeys.carriers, FilterKeys.queues] as const).map(
                    (filterKey) =>
                        filters[filterKey]?.map((filterItem) => (
                            <ActiveChip
                                codeList={authorizedCarriers}
                                key={`${filterKey}-filter-${filterItem}`}
                                code={filterItem}
                                allCodes={Object.fromEntries(
                                    filters[filterKey]?.map((item) => [
                                        item,
                                        item,
                                    ]) || []
                                )}
                                handleRemoveFilter={() => {
                                    removeFilter(filterKey, filterItem);
                                }}
                                t={t}
                            />
                        ))
                )}
            {(carriers.length > 0 ||
                queues.length > 0 ||
                escalated !== undefined) && <Clear onReset={onReset} />}
        </div>
    );
}
