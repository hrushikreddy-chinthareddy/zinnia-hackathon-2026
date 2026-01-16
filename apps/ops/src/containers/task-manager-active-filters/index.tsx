import dayjs from 'dayjs';
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
    scheduledDateStart?: string;
    scheduledDateEnd?: string;
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

    const { t: tAllFields } = useTranslation(undefined, {
        keyPrefix: 'allFields',
    });

    const [filtersActive, setFiltersActive] = useState(false);

    const {
        carriers = [],
        statuses = [],
        queues = [],
        escalated = undefined,
        scheduledDateStart = '',
        scheduledDateEnd = '',
    } = filters || {};

    useEffect(() => {
        if (
            carriers?.length ||
            queues?.length ||
            statuses?.length ||
            escalated !== undefined ||
            scheduledDateStart ||
            scheduledDateEnd
        ) {
            setFiltersActive(true);
        } else {
            setFiltersActive(false);
        }
    }, [
        carriers,
        statuses,
        queues,
        escalated,
        scheduledDateEnd,
        scheduledDateStart,
    ]);

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

    const getScheduledDateRange = () => {
        return `${tAllFields('scheduledDate')} : ${dayjs(
            scheduledDateStart,
            'MMDDYYYY'
        ).format('MM/DD/YYYY')}
         - ${dayjs(scheduledDateEnd, 'MMDDYYYY').format('MM/DD/YYYY')}`;
    };

    const hasActiveFilters =
        carriers.length > 0 ||
        queues.length > 0 ||
        Boolean(scheduledDateStart) ||
        Boolean(scheduledDateEnd) ||
        escalated !== undefined;

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

            {scheduledDateStart && scheduledDateEnd && (
                <ActiveChip
                    key="scheduledDateRange-filter"
                    code={getScheduledDateRange()}
                    allCodes={{}}
                    handleRemoveFilter={() => {
                        removeFilter(FilterKeys.scheduledDateStart, '');
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
            {hasActiveFilters && <Clear onReset={onReset} />}
        </div>
    );
}
