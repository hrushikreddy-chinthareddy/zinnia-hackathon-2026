import {
    Table,
    TableRow,
    TableBody,
    TableCell,
} from '@zinnia/bloom/components';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { Loader } from '@deps/components/page-loader';
import { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import {
    DEFAULT_SORTING_CONFIG,
    NO_ASSIGNEE,
} from '@deps/hooks/useTaskManagementQueue';
import {
    AssignedTask,
    ColSpanConfig,
    STORAGE_KEY,
    TaskStatus,
    UnassignedTask,
} from '@deps/models/case/task-instance';
import { ReactComponent as SettingsIcon } from '@deps/styles/elements/icons/actions/settings.svg';
import { browserLogError } from '@deps/utils/browser-logging';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import styles from '@deps/utils/styles';

import ColumnPicker from './table-elements/column-picker';
import { TaskStatusValues } from './task-management-queue-container';
import taskManagmentStyles from './task-management-queue.module.css';
import { TASK_COLUMNS, Column, ColumnId } from './task-queue-columns';
import TaskQueueTableHeader from './task-queue-table-header';
import TaskQueueTableRow from './task-queue-table-row';

const PaginationControls = dynamic(
    () => import('@deps/components/pagination/pagination')
);

type TaskQueueTableProps = {
    tasks: (AssignedTask | UnassignedTask)[];
    featureFlagDecisions: FeatureFlags;
    isLoading?: boolean;
    showClaimTask?: boolean;
    getTasks: any;
    setTaskDetails: any;
    filters: any;
    attachAssigneesToTasks: any;
    handleSort?: () => void;
    sortDirection?: string;
    additionalData: any;
    setErrorMessage: (message: string) => void;
    isOpsManagerView?: boolean;
    offset?: number;
    limit?: number;
    total?: number;
};

const TaskQueueTable = ({
    tasks,
    filters,
    setTaskDetails,
    attachAssigneesToTasks,
    featureFlagDecisions,
    isLoading,
    getTasks,
    handleSort,
    additionalData,
    setErrorMessage,
    isOpsManagerView,
    sortDirection,
    offset,
    limit = 10,
    total,
}: TaskQueueTableProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagementQueue',
    });
    const { t: tTaskView } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'tasksView',
    });

    const { t: tAllFields } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'allFields',
    });

    const showOwnerAgentColumns =
        featureFlagDecisions?.[FEATURE_FLAGS.OPS_MANAGER_AGENT_OWNER_FILTERS];

    // used in ops manager view only
    const availableColumns: Column<any>[] = useMemo(() => {
        if (!isOpsManagerView) return [];
        if (showOwnerAgentColumns) return TASK_COLUMNS;
        return TASK_COLUMNS.filter(
            (col) => !['owner', 'agent'].includes(col.id)
        );
    }, [isOpsManagerView, showOwnerAgentColumns]);

    const { lockedCols, selectable } = useMemo(() => {
        const lockedCols: Column<any>[] = [];
        const selectable: Column<any>[] = [];

        for (const col of availableColumns) {
            if (col.locked) lockedCols.push(col);
            else selectable.push(col);
        }

        return { lockedCols, selectable };
    }, [availableColumns]);

    //persisted toggleable selection of columns
    const [selectedIds, setSelectedIds] = useState<ColumnId[] | null>(null);

    const [openPopoverTaskId, setOpenPopoverTaskId] = useState<string | null>(
        null
    );

    useEffect(() => {
        if (!isOpsManagerView) return;
        if (typeof window === 'undefined') return;
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                setSelectedIds(JSON.parse(raw) as ColumnId[]);
            } catch {
                browserLogError('Error in parsing column selection');
            }
        }
    }, [isOpsManagerView]);

    const handleColumnChange = (ids: ColumnId[]) => {
        setSelectedIds(ids);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        }
    };

    const defaultSelectable = useMemo(
        () => selectable.filter((c) => c.defaultVisible).map((c) => c.id),
        [selectable]
    );

    //final visible columns combination of locked and selectable columns
    const visibleColumns: Column<any>[] | undefined = useMemo(() => {
        if (!isOpsManagerView) return undefined;
        const chosen = new Set(selectedIds ?? defaultSelectable);
        return [...lockedCols, ...selectable.filter((c) => chosen.has(c.id))];
    }, [
        isOpsManagerView,
        lockedCols,
        selectable,
        selectedIds,
        defaultSelectable,
    ]);

    useLayoutEffect(() => {
        if (!isOpsManagerView) return;

        // read the width calculated by browser
        const el = document.querySelector(
            '.opsManagerTaskTable table thead th .task-col-measure'
        );

        if (!el) return;

        const width = el.getBoundingClientRect().width;

        const root = document.querySelector(
            '.opsManagerTaskTable'
        ) as HTMLElement;
        root?.style.setProperty('--task-col-width', `${width}px`);
    }, [visibleColumns, tasks, isOpsManagerView]);

    const colCount = isOpsManagerView
        ? ColSpanConfig.OpsManager
        : ColSpanConfig.Default;

    const paginationControls = () => {
        const goToPage = (pageNumber: number) => {
            const newOffset = (pageNumber - 1) * limit;
            const filterData = filters?.additionalFilters
                ? { ...filters?.additionalFilters }
                : { ...additionalData?.taskListingParams };

            let payload = Object.assign({}, filters, filterData, {
                limit,
                offset: newOffset,
            });
            delete payload.additionalFilters;

            payload = Object.assign(payload, {
                queues:
                    (payload.queues || []).length > 0
                        ? payload.queues
                        : additionalData?.taskListingParams?.queues,
                carriers:
                    (payload.carriers || []).length > 0
                        ? payload.carriers
                        : additionalData?.taskListingParams?.carriers,
                statuses:
                    (payload.statuses || []).length > 0
                        ? payload.statuses
                        : TaskStatusValues.filter(
                              (status) =>
                                  status !== TaskStatus.Canceled &&
                                  status !== TaskStatus.Completed
                          ),
                sortDirection,
                ...(sortDirection && { sortBy: DEFAULT_SORTING_CONFIG.sortBy }),
            });

            getTasks(true, payload, undefined, true);
        };

        return (
            isOpsManagerView && (
                <PaginationControls
                    total={total ?? 0}
                    limit={limit ?? 0}
                    offset={offset ?? 0}
                    goToPage={goToPage}
                />
            )
        );
    };

    const manageTableAfterAction = async (
        taskId: string,
        assigneePartyId: string | null,
        updatedTask: AssignedTask | UnassignedTask
    ) => {
        const newTasks = [...tasks].map((task) => {
            if (task.id === updatedTask.id) {
                task.updatedAt = (updatedTask as any).updatedAt;
                if (!assigneePartyId) {
                    delete task.assigneePartyId;
                    task.assignee = NO_ASSIGNEE;
                    return task;
                } else {
                    task.assigneePartyId = assigneePartyId;
                    return task;
                }
            } else {
                return task;
            }
        });

        const newTasksWithUpdatedUsers = await attachAssigneesToTasks(newTasks);
        if (newTasksWithUpdatedUsers.length > 0)
            setTaskDetails(newTasksWithUpdatedUsers);
        return true;
    };

    return (
        <div className="my-1">
            {isOpsManagerView && (
                <div className="flex justify-end mb-2">
                    <ColumnPicker
                        title={tAllFields('dynamicFields') || ''}
                        availableColumns={availableColumns}
                        selectedIds={selectedIds}
                        onChange={handleColumnChange}
                        TriggerIcon={SettingsIcon}
                    />
                </div>
            )}

            <Table
                className={
                    isOpsManagerView
                        ? `!overflow-y-visible !overflow-x-scroll ${taskManagmentStyles.opsManagerTaskTable}`
                        : ''
                }
            >
                <TaskQueueTableHeader
                    isOpsManagerView={isOpsManagerView}
                    sortDirection={sortDirection}
                    visibleColumns={visibleColumns}
                    handleSort={handleSort}
                />
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell
                                className={taskManagmentStyles.loaderCell}
                                colSpan={colCount}
                            >
                                <div
                                    className={`${styles.loaderContainer} p-2`}
                                >
                                    <Loader
                                        variant={PageLoaderVariant.Center}
                                    />
                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                    {!isLoading &&
                        tasks.length > 0 &&
                        tasks.map(
                            (task, index) =>
                                task && (
                                    <TaskQueueTableRow
                                        key={`task_queue_${task.id}`}
                                        task={task}
                                        featureFlagDecisions={
                                            featureFlagDecisions
                                        }
                                        getTasks={() => {
                                            getTasks(true);
                                        }}
                                        setErrorMessage={setErrorMessage}
                                        tabIndex={index}
                                        isOpsManagerView={isOpsManagerView}
                                        manageTableAfterAction={
                                            manageTableAfterAction
                                        }
                                        setTaskDetails={setTaskDetails}
                                        visibleColumns={
                                            isOpsManagerView
                                                ? visibleColumns
                                                : undefined
                                        }
                                        openPopoverTaskId={openPopoverTaskId}
                                        setOpenPopoverTaskId={
                                            setOpenPopoverTaskId
                                        }
                                    />
                                )
                        )}

                    {tasks?.length === 0 && !isLoading && (
                        <TableRow className="disabled-tr w-full">
                            <TableCell
                                className="!text-left md:!text-center"
                                colSpan={colCount}
                            >
                                <Typography
                                    className="p-2"
                                    variant={TypographyVariant.BodySm}
                                >
                                    {t('noTasksFoundTitle')}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {isOpsManagerView && tasks?.length > 0 && (
                <div className="flex flex-col items-center lg:grid lg:grid-cols-3 mt-3">
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className={`mb-6 lg:mb-0`}
                    >
                        {tTaskView('xToYOfZ', {
                            x: (offset ?? 0) + 1,
                            y: Math.min(
                                (offset ?? 0) + (limit ?? 10),
                                total ?? 0
                            ),
                            z: `${total}${total === 10000 ? '+' : ''}`,
                        })}
                    </Typography>
                    {paginationControls()}
                </div>
            )}
        </div>
    );
};

export default TaskQueueTable;
