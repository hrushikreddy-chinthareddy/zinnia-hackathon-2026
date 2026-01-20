import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import Button, { ButtonType } from '@deps/components/button/button';
import { FieldSize, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelectRange from '@deps/components/fields/field-date-select-range/field-date-select-range';
import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import Select from '@deps/components/select/select';
import MultiselectField from '@deps/components/side-sheet/side-sheet-refine-results/multiselect-field';
import { Priority } from '@deps/components/side-sheet/side-sheet-refine-results/side-sheet-refine-results';
import {
    getCarrierListItem,
    getCarrierNameByClientId,
    getClientIdsByCarrierName,
} from '@deps/utils/carriers';

import { AdditionalFilters } from './side-sheet-tasks-filters-types';
import styles from './side-sheet-tasks-filters.module.css';
import { FILTER_KEYS } from './utils';

const REFINE_RESULTS_BASE_KEY = 'caseManagementDashboard.refineResultsOptions.';

type FilterPayload = {
    carriers: string[];
    queues: string[];
    escalated?: boolean | null;
    scheduledDateStart?: string;
    scheduledDateEnd?: string;
};

export interface SideSheetTasksResultsProps {
    closeSideSheet: () => void;
    authorizedCarriers: string[];
    handleApplyFilters: (
        additionalFilters: AdditionalFilters,
        payload: FilterPayload
    ) => void;
    searchValue: any;
    assigneeList: string[];
    allGroups: string[];
    clearFilters: () => void;
}

const initialAdditionalFilters: AdditionalFilters = {
    carriers: {},
    group: [],
    assignees: [],
    escalated: undefined,
    scheduledDateStart: '',
    scheduledDateEnd: '',
};

export default function SideSheetTasksResults({
    closeSideSheet,
    authorizedCarriers,
    searchValue,
    handleApplyFilters,
    clearFilters,
    allGroups,
}: SideSheetTasksResultsProps) {
    const { t } = useTranslation();
    const carrierFilterItems = authorizedCarriers.map((carrierCode: string) => {
        const displayValue =
            getCarrierNameByClientId(carrierCode) || carrierCode.toUpperCase();

        return {
            value:
                getClientIdsByCarrierName(authorizedCarriers, displayValue) ||
                carrierCode.toUpperCase(),
            displayText: displayValue,
            label: getCarrierListItem(carrierCode),
        };
    });

    const [additionalFilters, setAdditionalFilters] =
        useState<AdditionalFilters>(initialAdditionalFilters);
    const [groupList, setGroupList] = useState<string[]>([]);

    const getUniqueCarrierFilterItems = () => {
        const carrierLabels = new Set();

        const uniqueCarrierFilterItems = (
            carrierFilterItems.filter((item) => {
                if (carrierLabels.has(item.displayText)) {
                    return false;
                }

                carrierLabels.add(item.displayText);
                return true;
            }) as typeof carrierFilterItems
        ).sort((item1, item2) =>
            item1.displayText.localeCompare(item2.displayText)
        );
        return uniqueCarrierFilterItems;
    };

    const updateCarrierFilters = (
        clickedCarrier: string,
        displayText: string
    ): void => {
        const newCarriersFilters = { ...additionalFilters.carriers };

        if (newCarriersFilters[clickedCarrier]) {
            delete newCarriersFilters[clickedCarrier];
        } else {
            newCarriersFilters[clickedCarrier] = displayText;
        }

        setAdditionalFilters((prevFilters) => ({
            ...prevFilters,
            carriers: newCarriersFilters,
        }));
    };

    const handleFilterToggle = (
        filterKey: keyof typeof additionalFilters,
        selectedValue: string
    ) => {
        const currentValues = additionalFilters[filterKey] as string[];
        const updatedValues = currentValues.includes(selectedValue)
            ? currentValues.filter((val) => val !== selectedValue)
            : [...currentValues, selectedValue];

        setAdditionalFilters({
            ...additionalFilters,
            [filterKey]: updatedValues,
        });
    };

    const handleGroupChange = (selectedGroup: string) => {
        handleFilterToggle(FILTER_KEYS.GROUP, selectedGroup);
    };

    const handleSubmit = useCallback(() => {
        const {
            carriers,
            group,
            escalated,
            scheduledDateStart,
            scheduledDateEnd,
        } = additionalFilters;
        const payload = {
            carriers: Object.keys(carriers),
            queues: group,
            escalated: escalated,
            ...(scheduledDateStart &&
                scheduledDateEnd && { scheduledDateStart, scheduledDateEnd }),
        };

        handleApplyFilters(additionalFilters, payload);
        closeSideSheet();
    }, [additionalFilters]);

    const handleClear = () => {
        const newAdditionalFilters = { ...additionalFilters };
        newAdditionalFilters.carriers = {};
        newAdditionalFilters.group = [];
        newAdditionalFilters.assignees = [];
        newAdditionalFilters.escalated = undefined;
        newAdditionalFilters.scheduledDateStart = '';
        newAdditionalFilters.scheduledDateEnd = '';
        setAdditionalFilters(newAdditionalFilters);
    };

    const scheduledStartOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setAdditionalFilters((prev) => ({
            ...prev,
            scheduledDateStart: value,
        }));
    };

    const scheduledEndOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setAdditionalFilters((prev) => ({
            ...prev,
            scheduledDateEnd: value,
        }));
    };

    const handleReset = () => {
        handleClear();
        const { additionalFilters } = searchValue;
        if (
            (additionalFilters?.group || []).length > 0 ||
            Object.keys(additionalFilters?.carriers || {}).length > 0 ||
            additionalFilters?.scheduledDateStart ||
            additionalFilters?.escalated !== undefined
        ) {
            clearFilters();
        }
    };

    const selectedCarriers = additionalFilters.carriers ?? {};

    useEffect(() => {
        const {
            carriers,
            queues,
            statuses,
            escalated,
            scheduledDateStart,
            scheduledDateEnd,
        } = searchValue.additionalFilters || {};
        const carrierFilterItems = getUniqueCarrierFilterItems();

        const isFiltersApplied =
            [carriers, queues, statuses, scheduledDateStart].some(Boolean) ||
            escalated !== undefined;

        if (isFiltersApplied) {
            const selectedCarriers = Array.isArray(carriers)
                ? carriers?.map((carrier: string) => carrier.toUpperCase())
                : carriers && Object.keys(carriers).length > 0
                ? Object.keys(carriers).map((carrier: string) =>
                      carrier.toUpperCase()
                  )
                : [];
            setAdditionalFilters((prevFilters) => ({
                ...prevFilters,
                carriers: carrierFilterItems.reduce(
                    (acc: any, carrier: any) => {
                        if (selectedCarriers.includes(carrier.value)) {
                            acc[carrier.value] = carrier.displayText;
                        }
                        return acc;
                    },
                    {}
                ),
                escalated: escalated,
                group: queues || [],
                scheduledDateStart,
                scheduledDateEnd,
            }));
            if (!groupList.length) {
                setGroupList(allGroups || []);
            }
        }
    }, []);
    const handlePriorityChange = (value: string) => {
        setAdditionalFilters((prevFilters) => ({
            ...prevFilters,
            escalated:
                value === Priority.ANY ? null : value === Priority.PRIORITY,
        }));
    };
    const priorityOptions = [
        {
            label: `${t(`${REFINE_RESULTS_BASE_KEY}any`)}`,
            value: Priority.ANY,
        },
        {
            label: `${t(`${REFINE_RESULTS_BASE_KEY}onlyPrioritized`)}`,
            value: Priority.PRIORITY,
        },
        {
            label: `${t(`${REFINE_RESULTS_BASE_KEY}notPrioritized`)}`,
            value: Priority.NOT_PRIORITY,
        },
    ];

    const hasActiveFilters =
        (additionalFilters?.group || []).length > 0 ||
        Object.keys(additionalFilters?.carriers || {}).length > 0 ||
        additionalFilters?.scheduledDateStart ||
        additionalFilters.scheduledDateEnd ||
        additionalFilters.escalated !== undefined;

    return (
        <div className={styles.sideSheetContainer}>
            <>
                <div className={styles.section}>
                    <MultiselectField
                        isLoading={false}
                        label={t(`${REFINE_RESULTS_BASE_KEY}group`) as string}
                        options={allGroups}
                        value={new Set(additionalFilters.group)}
                        handleChange={handleGroupChange}
                    />
                    <Select
                        className={styles.fieldGroup}
                        isMultiselect
                        label={t(`${REFINE_RESULTS_BASE_KEY}carrier`) as string}
                        options={getUniqueCarrierFilterItems()}
                        value={selectedCarriers}
                        onChange={updateCarrierFilters}
                        size={FieldSize.Small}
                        placeholder={
                            t(
                                `${REFINE_RESULTS_BASE_KEY}selectCarrier`
                            ) as string
                        }
                        disabled={false}
                        name="carrier-dropdown-btn"
                    />

                    {/* <MultiselectField
                        isLoading={false}
                        label={
                            t(`${REFINE_RESULTS_BASE_KEY}assignee`) as string
                        }
                        options={assigneeList}
                        value={new Set(additionalFilters.assignees)}
                        handleChange={handleAssigneeChange}
                        disabled={true}
                    />
                          /> */}

                    <div className={styles.fieldGroup}>
                        <FieldDateSelectRange
                            startValue={
                                additionalFilters.scheduledDateStart || ''
                            }
                            endValue={additionalFilters.scheduledDateEnd || ''}
                            startLabel={t('allFields.scheduledDate') as string}
                            endLabel={t('allFields.scheduledDateEnd') as string}
                            startOnChange={scheduledStartOnChange}
                            endOnChange={scheduledEndOnChange}
                            startVariant={FieldVariant.Default}
                            endVariant={FieldVariant.Default}
                            placeholder={t('allFields.selectDate') as string}
                            closeOnDateSelect
                            size={FieldSize.Small}
                            isFutureDateDisabled={false}
                        />
                    </div>

                    <Select
                        options={priorityOptions}
                        onChange={handlePriorityChange}
                        value={
                            additionalFilters.escalated === null
                                ? Priority.ANY
                                : additionalFilters?.escalated?.toString()
                        }
                        size={FieldSize.Small}
                        label={
                            t(`${REFINE_RESULTS_BASE_KEY}priority`) as string
                        }
                        placeholder={
                            t(
                                `${REFINE_RESULTS_BASE_KEY}selectPriority`
                            ) as string
                        }
                        className="!w-[198px] mt-6"
                    />
                </div>
            </>
            <div className={styles.actions}>
                <div className={styles.actionsRow}>
                    <Button
                        type={ButtonType.Primary}
                        onClick={handleSubmit}
                        aria-label={t('ariaLabel.applyFilters') as string}
                        className={styles.applyBtn}
                    >
                        <p className={styles.applyBtnText}>
                            {t(`${REFINE_RESULTS_BASE_KEY}applyFilters`)}
                        </p>
                    </Button>
                    <NavElement
                        disabled={!hasActiveFilters}
                        type={NavElementType.Button}
                        className={styles.clearAllBtn}
                        onClick={handleReset}
                        aria-label={t('ariaLabel.clearAllFilters') as string}
                    >
                        {t(`${REFINE_RESULTS_BASE_KEY}clearAll`)}
                    </NavElement>
                </div>
            </div>
        </div>
    );
}
