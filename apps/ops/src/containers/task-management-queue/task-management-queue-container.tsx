import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { TFunction, useTranslation } from 'next-i18next';
import { useState, useCallback } from 'react';

import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';
import Content, { ContentVariant } from '@deps/components/content/content';
import SearchBar from '@deps/components/search/search-bar';
import { SearchBarInitialValues } from '@deps/components/search/search-bar-initial-value';
import MultiselectField from '@deps/components/side-sheet/side-sheet-refine-results/multiselect-field';
import { TranslationFiles } from '@deps/config/translations';
import TaskManagerActiveFilters from '@deps/containers/task-manager-active-filters/';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import useTaskManagementQueue, {
    DEFAULT_SORTING_CONFIG,
} from '@deps/hooks/useTaskManagementQueue';
import { FilterKeys, MessageType } from '@deps/models/case/task';
import { TaskLabel, TaskStatus } from '@deps/models/case/task-instance';
import { UserProfile } from '@deps/models/user-profile';
import { TaskListingParams } from '@deps/pages/tasks';
import { ReactComponent as FilterIcon } from '@deps/styles/elements/icons/icons_outlined/filter.svg';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys } from '@deps/types/search';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import TaskQueueTable from './task-queue-table';
import { SortingTypeValues } from './task-queue-table-header';
const SideSheetTasksResults = dynamic(
    () =>
        import(
            '@deps/containers/side-sheet-tasks-filters/side-sheet-tasks-filters'
        )
);

const fieldKeyMapping: Record<string, string> = {
    taskName: 'taskName',
    caseId: 'caseId',
};

export const TaskStatusValues = Object.keys(TaskLabel)
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

type TaskManagementQueueProps = {
    featureFlagDecisions: FeatureFlags;
    showClaimTask?: boolean;
    additionalData?: {
        user: UserProfile;
        authorizedCarriers?: string[];
        taskListingParams?: TaskListingParams;
        assigneeList?: string[];
        escalated?: boolean;
    };
    isOpsManagerView?: boolean;
};

type SearchParamsPayload = {
    caseId?: string;
    taskName?: string;
    carriers?: string[];
    queues?: string[];
    statuses?: string[];
    sortDirection?: string;
    scheduledDate?: string;
    escalated?: boolean | null | undefined;
};

// type TaskSearchKeys = 'caseId' | 'taskName';
const getToggleLabels = (t: TFunction): LabelValue<PolicySearchKeys>[] => [
    {
        label: t('tasksView.search.buttons.taskName'),
        value: 'taskName',
        placeholder: t('tasksView.search.placeHolder.taskName') || '',
    },
    {
        label: t('tasksView.search.buttons.caseID'),
        value: 'caseId',
        placeholder: t('tasksView.search.placeHolder.caseID') || '',
        format: '###-##-####',
    },
];

const TaskManagementQueue = ({
    featureFlagDecisions,
    showClaimTask,
    additionalData,
    isOpsManagerView,
}: TaskManagementQueueProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagementQueue',
    });
    const { t: tTaskView } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'tasksView',
    });
    const sideSheet = useSideSheetContext();
    const [searchValue, setSearchValue] = useState(SearchBarInitialValues);
    const DEFAULT_TOGGLE_VALUE = 'taskName' as PolicySearchKeys;
    const [toggleValue, setToggleValue] = useState(DEFAULT_TOGGLE_VALUE);

    const {
        taskDetails,
        setTaskDetails,
        attachAssigneesToTasks,
        isLoading,
        errorMessage,
        getTasks,
        handleClaimTask,
        errorType,
        setErrorMessage,
        offset,
        limit,
        total,
    } = useTaskManagementQueue({ isOpsManagerView, additionalData });

    const [sortDirection, setSortDirection] = useState(
        DEFAULT_SORTING_CONFIG.sortDirection
    );

    const transformCarriers = (carriers?: string[]): string[] => {
        if (!Array.isArray(carriers)) return [];
        return carriers.map((carrier) => carrier.toUpperCase());
    };

    const enableClaimTask = taskDetails.every(
        (task) => task.status === TaskStatus.Scheduled
    );

    const getSafeSearchParams = (searchParams: SearchParamsPayload) => {
        const {
            carriers = [],
            queues = [],
            statuses = [],
            escalated,
            scheduledDate,
        } = searchParams;
        const safeSearchParams = {
            ...searchParams,
            ...(carriers && carriers.length > 0
                ? { carriers }
                : { carriers: additionalData?.taskListingParams?.carriers }),
            ...(queues && queues.length > 0
                ? { queues }
                : { queues: additionalData?.taskListingParams?.queues }),
            ...(statuses.length > 0
                ? { statuses }
                : getStatusPayload(statuses)),
            sortDirection: searchParams.sortDirection || sortDirection,
            sortBy: DEFAULT_SORTING_CONFIG.sortBy,
            ...(escalated !== undefined && { escalated }),
            ...(scheduledDate && {
                scheduledDate: dayjs
                    .utc(scheduledDate, NUMERIC_DATE_FORMAT)
                    .toISOString(),
            }),
        };

        return safeSearchParams;
    };

    const handleSort = () => {
        let payload = {
            ...searchValue,
            ...searchValue.additionalFilters,
        };

        delete payload.additionalFilters;

        const newSortDirection =
            sortDirection === SortingTypeValues.DESCENDING
                ? SortingTypeValues.ASCENDING
                : SortingTypeValues.DESCENDING;
        setSortDirection(newSortDirection);

        payload = {
            ...payload,
            sortDirection: newSortDirection,
            sortBy: DEFAULT_SORTING_CONFIG.sortBy,
        };

        getTasks(true, getSafeSearchParams(payload));
    };

    const handleSearch = useCallback(
        (value: Record<string, string>) => {
            const [field, fieldValue] = Object.entries(value)[0];

            if (!fieldValue) return;

            const backendField = fieldKeyMapping[field];
            if (!backendField) return;

            const additionalFilters = searchValue?.additionalFilters || {};

            const searchParams = {
                [backendField]: fieldValue,
                ...additionalFilters,
                ...(additionalFilters.carriers && {
                    carriers: transformCarriers(additionalFilters.carriers),
                }),
            };

            setSearchValue((prev) => ({
                [backendField]: fieldValue,
                additionalFilters: prev.additionalFilters,
            }));
            getTasks(true, getSafeSearchParams(searchParams));
        },
        [getTasks, searchValue]
    );

    const getStatusPayload = (statuses: string[] = []) => {
        return {
            statuses:
                statuses.length > 0
                    ? statuses
                    : TaskStatusValues.filter(
                          (status) =>
                              status !== TaskStatus.Canceled &&
                              status !== TaskStatus.Completed
                      ),
        };
    };

    const handleApplyFilters = useCallback(
        (additionalFilters: any, payload: any) => {
            const newFilters = {
                carriers: transformCarriers(
                    Object.keys(additionalFilters.carriers)
                ),
                queues: additionalFilters.group,
                escalated: additionalFilters.escalated,
                scheduledDate: additionalFilters.scheduledDate,
            };

            const copy = { ...searchValue };
            const statuses = copy.additionalFilters?.statuses || [];
            delete copy.additionalFilters;

            setSearchValue({
                ...copy,
                additionalFilters: {
                    ...searchValue.additionalFilters,
                    ...newFilters,
                },
            });
            getTasks(
                true,
                getSafeSearchParams({
                    ...copy,
                    ...payload,
                    statuses,
                })
            );
        },
        [getTasks, searchValue]
    );

    const handleTaskStatusChange = (selectedStatus: string) => {
        const currentStatuses = searchValue?.additionalFilters?.statuses || [];
        const updatedStatuses = currentStatuses.includes(selectedStatus)
            ? currentStatuses.filter(
                  (status: string) => status !== selectedStatus
              )
            : [...currentStatuses, selectedStatus];

        setSearchValue((prev) => {
            return {
                ...prev,
                additionalFilters: {
                    ...prev.additionalFilters,
                    statuses: updatedStatuses,
                },
            };
        });

        const payload = {
            ...searchValue,
            ...searchValue.additionalFilters,
        };

        delete payload?.additionalFilters;

        getTasks(true, {
            ...getSafeSearchParams({
                ...payload,
                statuses: updatedStatuses,
            }),
        });
    };

    const handleFilterRemove = useCallback(
        (filterName: string, value: string) => {
            const updated = { ...searchValue.additionalFilters };

            if (filterName === FilterKeys.escalated) {
                updated[filterName] = undefined;
            } else {
                const current = updated[filterName];
                if (!current) return;
                updated[filterName] = current.filter(
                    (v: string) => v !== value
                );
            }

            const newSearchValue = {
                ...searchValue,
                additionalFilters: updated,
            };

            const payload = {
                ...newSearchValue,
                ...updated,
            };
            delete payload.additionalFilters;

            setSearchValue(newSearchValue);
            getTasks(true, getSafeSearchParams(payload));
        },
        [searchValue]
    );

    function resetAdditionalFilters(additionalFilters: Record<string, any>) {
        Object.keys(additionalFilters).forEach((key) => {
            if (key === FilterKeys.statuses) return;

            if (key === FilterKeys.escalated) {
                additionalFilters[key] = undefined;
            } else if (key === FilterKeys.scheduledDate) {
                additionalFilters[key] = '';
            } else {
                additionalFilters[key] = [];
            }
        });

        return additionalFilters;
    }

    const handleReset = useCallback(() => {
        const newSearchValue = { ...searchValue };
        const statuses = newSearchValue?.additionalFilters?.statuses || [];

        if (newSearchValue.additionalFilters) {
            resetAdditionalFilters(newSearchValue.additionalFilters);
        }

        const { additionalFilters, ...payload } = newSearchValue;

        setSearchValue(newSearchValue);

        getTasks(true, {
            ...payload,
            ...additionalData?.taskListingParams,
            ...getStatusPayload(statuses),
            sortDirection,
            sortBy: DEFAULT_SORTING_CONFIG.sortBy,
        });
    }, [getTasks, searchValue]);

    const handleToggle = (newToggleValue: PolicySearchKeys) => {
        const newSearchValue = {
            ...searchValue,
        };
        delete newSearchValue[toggleValue];

        setToggleValue(newToggleValue);
    };

    const handleClear = useCallback(() => {
        const newValue = { ...searchValue };
        delete newValue[toggleValue];
        const { additionalFilters } = newValue;
        const statuses = additionalFilters?.statuses || [];

        setSearchValue({ additionalFilters });

        getTasks(
            true,
            getSafeSearchParams({
                ...additionalFilters,
                carriers: transformCarriers(additionalFilters?.carriers),
                ...getStatusPayload(statuses),
            })
        );
    }, [searchValue, toggleValue]);

    const clearFilters = useCallback(() => {
        const newSearchValue = { ...searchValue };
        const searchParams = { ...newSearchValue };
        const statuses = searchParams?.additionalFilters?.statuses || [];

        delete searchParams?.additionalFilters;

        if (newSearchValue?.additionalFilters) {
            resetAdditionalFilters(newSearchValue.additionalFilters);

            setSearchValue(newSearchValue);

            getTasks(true, {
                ...searchParams,
                ...additionalData?.taskListingParams,
                ...getStatusPayload(statuses),
                sortDirection,
                sortBy: DEFAULT_SORTING_CONFIG.sortBy,
            });
        } else {
            return;
        }
    }, [handleApplyFilters, handleClear]);

    const handleCloseSideSheet = useCallback(() => {
        sideSheet.handleOpen(false);
    }, [sideSheet]);

    const openRefineResultsSidesheet = () => {
        sideSheet.changeSideSheetContent(
            tTaskView('filters.headers.title') as string,
            <SideSheetTasksResults
                authorizedCarriers={additionalData?.authorizedCarriers || []}
                handleApplyFilters={handleApplyFilters}
                closeSideSheet={handleCloseSideSheet}
                searchValue={searchValue}
                assigneeList={additionalData?.assigneeList || []}
                allGroups={additionalData?.taskListingParams?.queues || []}
                clearFilters={clearFilters}
            />
        );
        sideSheet.handleOpen(true);
    };

    const handleKeyDownToOpenRefineResultsSidesheeet = useCallback(
        (e: React.KeyboardEvent) => {
            const ENTER_KEY = 'Enter';
            if (e.key === ENTER_KEY || e.key === ' ') {
                e.preventDefault();
                openRefineResultsSidesheet();
            }
        },
        [openRefineResultsSidesheet]
    );
    return (
        <>
            {isOpsManagerView && (
                <>
                    <SearchBar
                        searchValue={searchValue}
                        onSearch={handleSearch}
                        initialToggleValue={toggleValue}
                        toggleLabels={getToggleLabels}
                        onToggle={handleToggle}
                        onClear={handleClear}
                        disabled={isLoading}
                    />
                    <div className="flex flex-row gap-3 items-end mb-4">
                        <MultiselectField
                            className="!m-0 w-1/5"
                            isLoading={false}
                            label={t('status') as string}
                            options={TaskStatusValues}
                            disabled={isLoading}
                            value={
                                new Set(
                                    Array.isArray(
                                        searchValue?.additionalFilters?.statuses
                                    )
                                        ? searchValue.additionalFilters.statuses
                                        : []
                                )
                            }
                            handleChange={handleTaskStatusChange}
                            customLabelMap={customLabelMap}
                        />
                        <Button
                            onClick={openRefineResultsSidesheet}
                            data-testid="search-btn"
                            aria-label="Add filters"
                            type={ButtonType.Secondary}
                            size={ButtonSize.Small}
                            className="flex items-center whitespace-nowrap mt-5 !border-none !bg-white"
                            onKeyDown={
                                handleKeyDownToOpenRefineResultsSidesheeet
                            }
                            disabled={isLoading}
                        >
                            <FilterIcon
                                className="text-secondary"
                                width={16}
                                height={16}
                            />
                            <Content
                                contentClassName="text-secondary"
                                variant={ContentVariant.BodyBold}
                                details={
                                    tTaskView(
                                        'filters.buttons.addFilters'
                                    ) as string
                                }
                            />
                        </Button>
                    </div>
                    <TaskManagerActiveFilters
                        authorizedCarriers={
                            additionalData?.authorizedCarriers as string[]
                        }
                        filters={searchValue.additionalFilters}
                        removeFilter={handleFilterRemove}
                        onReset={handleReset}
                    />
                </>
            )}

            <div className="flex flex-col mb-4">
                {showClaimTask && (
                    <div className="my-3 flex justify-end">
                        <div className="self-center xl:mt-5 xl:self-baseline">
                            <Button
                                type={ButtonType.Primary}
                                onClick={handleClaimTask}
                                data-testid="claim-task"
                                aria-label={t('claimTask') as string}
                                size={ButtonSize.Small}
                                disabled={!enableClaimTask || isLoading}
                                variant={ButtonVariant.Default}
                            >
                                {t('claimTask')}
                            </Button>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <AssistiveText
                        text={errorMessage}
                        variant={
                            errorType == MessageType.Info
                                ? AssistiveTextVariant.Info
                                : AssistiveTextVariant.Error
                        }
                        className="my-4"
                    />
                )}

                <TaskQueueTable
                    tasks={taskDetails}
                    filters={searchValue}
                    setTaskDetails={setTaskDetails}
                    attachAssigneesToTasks={attachAssigneesToTasks}
                    isLoading={isLoading}
                    featureFlagDecisions={featureFlagDecisions}
                    additionalData={additionalData}
                    showClaimTask={showClaimTask}
                    getTasks={getTasks}
                    handleSort={handleSort}
                    sortDirection={sortDirection}
                    isOpsManagerView={isOpsManagerView}
                    setErrorMessage={setErrorMessage}
                    offset={offset}
                    limit={limit}
                    total={total}
                />
            </div>
        </>
    );
};

export default TaskManagementQueue;
