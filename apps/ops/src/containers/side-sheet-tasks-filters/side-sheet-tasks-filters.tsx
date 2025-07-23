import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import Button, { ButtonType } from '@deps/components/button/button';
import { FieldSize } from '@deps/components/fields/field';
import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import Select from '@deps/components/select/select';
import MultiselectField from '@deps/components/side-sheet/side-sheet-refine-results/multiselect-field';
import { TaskLabel, TaskStatus } from '@deps/models/case/task-instance';
import {
    getCarrierListItem,
    getCarrierNameByClientId,
    getClientIdsByCarrierName,
} from '@deps/utils/carriers';

import { FILTER_KEYS } from './utils';

const REFINE_RESULTS_BASE_KEY = 'caseManagementDashboard.refineResultsOptions.';

const TaskStatusValues = Object.keys(TaskLabel)
    .filter((key) => key !== TaskLabel.Closed)
    .map((key) => TaskStatus[key as keyof typeof TaskStatus])
    .filter(Boolean);

const customLabelMap: Record<string, string> = Object.keys(TaskLabel).reduce(
    (acc, key) => {
        if (key === TaskLabel.Closed) return acc;

        const statusValue = TaskStatus[key as keyof typeof TaskStatus];
        const labelValue = TaskLabel[key as keyof typeof TaskLabel];

        if (statusValue && labelValue) {
            acc[statusValue] = labelValue;
        }

        return acc;
    },
    {} as Record<string, string>
);

type Errors = {
    createdDateStart?: string;
    createdDateEnd?: string;
    updatedDateStart?: string;
    updatedDateEnd?: string;
};

type FilterPayload = {
    carriers: string[];
    statuses: string[];
    queues: string[];
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

type Carriers = {
    [key: string]: string;
};

type AdditionalFilters = {
    carriers: Carriers;
    taskStatus: string[];
    group: string[];
    assignees: string[];
};

const initialAdditionalFilters: AdditionalFilters = {
    carriers: {},
    taskStatus: [],
    group: [],
    assignees: [],
};

export default function SideSheetTasksResults({
    closeSideSheet,
    authorizedCarriers,
    searchValue,
    handleApplyFilters,
    clearFilters,
    assigneeList,
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
    const [errors, setErrors] = useState<Errors>({});

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

    // update ProductName when carrier changes

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

    const handleTaskStatusChange = (selectedStatus: string) => {
        handleFilterToggle(FILTER_KEYS.TASK_STATUS, selectedStatus);
    };

    const handleGroupChange = (selectedGroup: string) => {
        handleFilterToggle(FILTER_KEYS.GROUP, selectedGroup);
    };

    const handleAssigneeChange = (selectedAssignee: string) => {
        handleFilterToggle(FILTER_KEYS.ASSIGNEES, selectedAssignee);
    };

    const handleSubmit = useCallback(() => {
        const { carriers, taskStatus, group } = additionalFilters;
        const payload = {
            carriers: Object.keys(carriers),
            statuses: taskStatus,
            queues: group,
        };

        handleApplyFilters(additionalFilters, payload);
        closeSideSheet();
    }, [additionalFilters]);
    const handleReset = () => {
        handleClear();
        clearFilters();
    };

    const handleClear = () => {
        const newAdditionalFilters = { ...additionalFilters };
        newAdditionalFilters.carriers = {};
        newAdditionalFilters.taskStatus = [];
        newAdditionalFilters.group = [];
        newAdditionalFilters.assignees = [];
        setAdditionalFilters(newAdditionalFilters);
    };

    const selectedCarriers = additionalFilters.carriers ?? {};

    useEffect(() => {
        const { carriers, queues, statuses } =
            searchValue.additionalFilters || {};
        const carrierFilterItems = getUniqueCarrierFilterItems();

        if (carriers || queues || statuses) {
            const selectedCarriers = Array.isArray(carriers)
                ? carriers?.map((carrier: string) => carrier.toUpperCase())
                : Object.keys(carriers).map((carrier: string) =>
                      carrier.toUpperCase()
                  );
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
                group: queues || [],
                taskStatus: statuses || [],
            }));
            if (!groupList.length) {
                setGroupList(allGroups || []);
            }
        }
    }, []);

    return (
        <div className="flex flex-col px-8">
            <>
                <div className="py-8">
                    <MultiselectField
                        isLoading={false}
                        label={
                            t(`${REFINE_RESULTS_BASE_KEY}taskStatus`) as string
                        }
                        options={TaskStatusValues}
                        value={new Set(additionalFilters.taskStatus)}
                        handleChange={handleTaskStatusChange}
                        customLabelMap={customLabelMap}
                    />
                    <MultiselectField
                        isLoading={false}
                        label={t(`${REFINE_RESULTS_BASE_KEY}group`) as string}
                        options={allGroups}
                        value={new Set(additionalFilters.group)}
                        handleChange={handleGroupChange}
                    />
                    <Select
                        className="mt-6"
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

                    <MultiselectField
                        isLoading={false}
                        label={
                            t(`${REFINE_RESULTS_BASE_KEY}assignee`) as string
                        }
                        options={assigneeList}
                        value={new Set(additionalFilters.assignees)}
                        handleChange={handleAssigneeChange}
                        disabled={true}
                    />
                </div>
            </>
            <div className="flex flex-col gap-12 py-8">
                <div className="flex flex-row">
                    <Button
                        type={ButtonType.Primary}
                        onClick={handleSubmit}
                        aria-label={t('ariaLabel.applyFilters') as string}
                        className="mr-6"
                    >
                        <p className="font-primary text-[18px] font-semibold leading-6.5">
                            {t(`${REFINE_RESULTS_BASE_KEY}applyFilters`)}
                        </p>
                    </Button>
                    <NavElement
                        type={NavElementType.Button}
                        className="flex self-center whitespace-nowrap"
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
