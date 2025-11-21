import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import dynamic from 'next/dynamic';
import { TFunction, useTranslation } from 'next-i18next';
import { useState, useCallback } from 'react';

import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';
import SearchBar from '@deps/components/search/search-bar';
import { SearchBarInitialValues } from '@deps/components/search/search-bar-initial-value';
import { TranslationFiles } from '@deps/config/translations';
import TaskManagerActiveFilters from '@deps/containers/task-manager-active-filters/';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import useTaskManagementQueue from '@deps/hooks/useTaskManagementQueue';
import { MessageType } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { UserProfile } from '@deps/models/user-profile';
import { TaskListingParams } from '@deps/pages/tasks';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/icons_outlined/add.svg';
import { LabelValue } from '@deps/types/data';
import { PolicySearchKeys } from '@deps/types/search';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import TaskQueueTable from './task-queue-table';
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

type TaskManagementQueueProps = {
    featureFlagDecisions: FeatureFlags;
    showClaimTask?: boolean;
    additionalData?: {
        user: UserProfile;
        authorizedCarriers?: string[];
        taskListingParams?: TaskListingParams;
        assigneeList?: string[];
    };
    isOpsManagerView?: boolean;
};

type SearchParamsPayload = {
    caseId?: string;
    taskName?: string;
    carriers?: string[];
    queues?: string[];
    statuses?: string[];
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

    const transformCarriers = (carriers?: string[]): string[] => {
        if (!Array.isArray(carriers)) return [];
        return carriers.map((carrier) => carrier.toUpperCase());
    };

    const enableClaimTask = taskDetails.every(
        (task) => task.status === TaskStatus.Scheduled
    );

    const getSafeSearchParams = (searchParams: SearchParamsPayload) => {
        const { carriers, queues } = searchParams;
        const safeSearchParams = {
            ...searchParams,
            ...(carriers && carriers.length > 0
                ? { carriers }
                : { carriers: additionalData?.taskListingParams?.carriers }),
            ...(queues && queues.length > 0
                ? { queues }
                : { queues: additionalData?.taskListingParams?.queues }),
        };

        return safeSearchParams;
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

    const handleApplyFilters = useCallback(
        (additionalFilters: any, payload: any) => {
            const newFilters = {
                carriers: transformCarriers(
                    Object.keys(additionalFilters.carriers)
                ),
                statuses: additionalFilters.taskStatus,
                queues: additionalFilters.group,
            };

            const copy = { ...searchValue };
            delete copy.additionalFilters;

            setSearchValue({ ...copy, additionalFilters: newFilters });
            getTasks(true, getSafeSearchParams({ ...copy, ...payload }));
        },
        [getTasks, searchValue]
    );

    const handleFilterRemove = useCallback(
        (filterName: string, filterValueToRemove: string) => {
            if (!searchValue?.additionalFilters?.[filterName]) return;

            const updatedFilterValues = searchValue.additionalFilters[
                filterName
            ].filter((value: string) => value !== filterValueToRemove);

            const newSearchValue = {
                ...searchValue,
                additionalFilters: {
                    ...searchValue.additionalFilters,
                    [filterName]: updatedFilterValues,
                },
            };

            const payload = {
                ...newSearchValue,
                ...newSearchValue.additionalFilters,
            };

            delete payload.additionalFilters;

            setSearchValue(newSearchValue);
            getTasks(true, getSafeSearchParams(payload));
        },
        [searchValue, setSearchValue]
    );

    const handleReset = useCallback(() => {
        const newSearchValue = { ...searchValue };

        if (newSearchValue.additionalFilters) {
            Object.keys(newSearchValue.additionalFilters).forEach((key) => {
                newSearchValue.additionalFilters[key] = [];
            });
        }

        const { additionalFilters, ...payload } = newSearchValue;

        setSearchValue(newSearchValue);

        getTasks(true, {
            ...payload,
            ...additionalData?.taskListingParams,
        });
    }, [getTasks, searchValue]);

    const handleToggle = (newToggleValue: PolicySearchKeys) => {
        const newSearchValue = {
            ...searchValue,
        };
        // remove old toggle key
        delete newSearchValue[toggleValue];

        setToggleValue(newToggleValue);
    };

    const handleClear = useCallback(() => {
        const newValue = { ...searchValue };
        delete newValue[toggleValue];
        const { additionalFilters } = newValue;

        setSearchValue({ additionalFilters });

        getTasks(
            true,
            getSafeSearchParams({
                ...additionalFilters,
                carriers: transformCarriers(additionalFilters?.carriers),
            })
        );
    }, [searchValue, toggleValue]);

    const clearFilters = useCallback(() => {
        const newSearchValue = { ...searchValue };
        const searchParams = { ...newSearchValue };

        delete searchParams?.additionalFilters;

        Object.keys(newSearchValue.additionalFilters).forEach((key) => {
            newSearchValue.additionalFilters[key] = [];
        });

        setSearchValue(newSearchValue);

        getTasks(true, {
            ...searchParams,
            ...additionalData?.taskListingParams,
        });
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
                    <Button
                        onClick={openRefineResultsSidesheet}
                        data-testid="search-btn"
                        type={ButtonType.Secondary}
                        size={ButtonSize.Small}
                        className="flex items-center whitespace-nowrap mt-5 mb-5"
                        onKeyDown={handleKeyDownToOpenRefineResultsSidesheeet}
                        disabled={isLoading}
                    >
                        <AddIcon width={12} height={12} />
                        {tTaskView('filters.buttons.addFilter')}
                    </Button>
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
