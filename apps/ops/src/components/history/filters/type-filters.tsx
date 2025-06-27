import { Transition } from '@headlessui/react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import ChipX from '@deps/components/chip/chip-x';
import {
    getFilter,
    hasFilter,
    removeAllFilters,
    removeEventFilter,
    setFilter,
    setYearFilter,
} from '@deps/components/history/filters/filter.helpers';
import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import {
    AllFilters,
    EventFilterKeys,
    HistoryFilters,
    PeopleFilters,
    PolicyFilters,
    TransactionFilters,
    useHistoryFiltersContext,
} from '@deps/contexts/HistoryFiltersContext';

interface FilterChipsProps {
    filters: AllFilters[];
    label: string;
    selectedChip: string;
    selectionCallback: (filter: AllFilters) => void;
}

interface DismissableFiltersProps {
    isSideSheetOpen: boolean;
}

export const DismissableFilters = ({
    isSideSheetOpen,
}: DismissableFiltersProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.history.filter',
    });
    const { historyFilters, setHistoryFilters } = useHistoryFiltersContext();
    const [historyFiltersCopy, setHistoryFiltersCopy] =
        useState<HistoryFilters>(historyFilters);

    useEffect(() => {
        if (!isSideSheetOpen) setHistoryFiltersCopy(historyFilters);
    }, [historyFilters, isSideSheetOpen]);

    const { eventFilter, yearFilter } = historyFiltersCopy;

    const hasActiveFilter = hasFilter(eventFilter) || hasFilter(yearFilter);

    if (!hasActiveFilter) return null;

    const [filterName, subfilterName] =
        Object.entries(eventFilter ?? {})[0] ?? [];
    const filterNameTranslation = t(filterName);
    const subfilterNameTranslation = t(subfilterName);

    return (
        <div className="flex flex-wrap content-center items-center gap-2 lg:hidden">
            {hasFilter(yearFilter) && (
                <ChipX
                    aria-label={
                        t('clearFilter', { filter: yearFilter }) as string
                    }
                    label={yearFilter as string}
                    onDelete={() => setYearFilter(setHistoryFilters, 'all')}
                />
            )}

            {hasFilter(filterName) && (
                <ChipX
                    aria-label={
                        t('clearFilter', {
                            filter: filterNameTranslation,
                        }) as string
                    }
                    label={filterNameTranslation as string}
                    onDelete={() => removeEventFilter(setHistoryFilters)}
                />
            )}
            {hasFilter(subfilterName) && (
                <ChipX
                    aria-label={
                        t('clearFilter', {
                            filter: subfilterNameTranslation,
                        }) as string
                    }
                    label={subfilterNameTranslation as string}
                    onDelete={() => {
                        setHistoryFilters((prevState) => ({
                            ...prevState,
                            eventFilter: {
                                [filterName]: 'all',
                            },
                        }));
                    }}
                />
            )}

            {hasActiveFilter && (
                <NavElement
                    onClick={() => removeAllFilters(setHistoryFilters)}
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                >
                    {t('clearAllFilters')}
                </NavElement>
            )}
        </div>
    );
};

const FilterChips = ({
    label,
    filters,
    selectedChip,
    selectionCallback,
}: FilterChipsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.history.filter',
    });

    return (
        <div className="flex flex-col gap-2">
            <Label label={label} variant={LabelVariant.FieldLabel} />
            <div className="flex flex-wrap gap-2">
                <RadioGroup.Root
                    aria-label={label}
                    className="flex flex-wrap gap-2"
                    onValueChange={(filter: AllFilters) =>
                        selectionCallback(filter)
                    }
                    value={selectedChip}
                >
                    {filters.map((filter) => {
                        return (
                            <RadioGroup.Item
                                className="chip"
                                key={filter}
                                value={filter}
                            >
                                {t(filter)}
                            </RadioGroup.Item>
                        );
                    })}
                </RadioGroup.Root>
            </div>
        </div>
    );
};

const Subfilter = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.history.filter',
    });
    const { historyFilters, setHistoryFilters } = useHistoryFiltersContext();

    const { eventFilter } = historyFilters;
    const { filterName, subfilterName } = getFilter(eventFilter);

    let filters;
    let label;

    switch (filterName) {
        case EventFilterKeys.Policy:
            filters = Object.values(PolicyFilters);
            label = t('byPolicyEvent') as string;
            break;
        case EventFilterKeys.Transactions:
            filters = Object.values(TransactionFilters);
            label = t('byTransaction') as string;
            break;
        case EventFilterKeys.People:
            filters = Object.values(PeopleFilters);
            label = t('byPeople') as string;
            break;
        default:
            return null;
    }

    return (
        <FilterChips
            filters={filters}
            label={label}
            selectedChip={subfilterName}
            selectionCallback={(filter) => {
                setFilter(setHistoryFilters, filterName, filter);
            }}
        />
    );
};

const TypeFilters = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.history.filter',
    });
    const { historyFilters, setHistoryFilters } = useHistoryFiltersContext();

    const { eventFilter } = historyFilters;
    const { filterName } = getFilter(eventFilter);

    return (
        <div className="flex flex-col gap-6">
            <FilterChips
                filters={Object.values(EventFilterKeys)}
                label={t('byEvent') as string}
                selectedChip={filterName ?? EventFilterKeys.All}
                selectionCallback={(filter) => {
                    if (filter === EventFilterKeys.All) {
                        removeEventFilter(setHistoryFilters);
                    } else
                        setFilter(
                            setHistoryFilters,
                            filter as EventFilterKeys,
                            EventFilterKeys.All
                        );
                }}
            />

            <Transition
                as="div"
                show={hasFilter(filterName)}
                enter="transition ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
            >
                <Subfilter />
            </Transition>
        </div>
    );
};

export default TypeFilters;
