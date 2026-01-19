import {
    TableRow,
    TableCell,
    Tooltip,
    TooltipPlacement,
    Loader,
    LoaderVariant,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';

import Avatar from '@deps/components/avatar/avatar';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import Content, { ContentVariant } from '@deps/components/content/content';
import IconButton from '@deps/components/icon-button/icon-button';
import { AssigneeField } from '@deps/components/side-sheet/task-details-sidesheet/components/assignee-field';
import GlobalTaskSideSheet from '@deps/components/side-sheet/task-details-sidesheet/global-task-sidesheet-content';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
import {
    getUserNameFromEmail,
    NO_ASSIGNEE,
} from '@deps/hooks/useTaskManagementQueue';
import {
    AssignedTask,
    TaskStatus,
    UnassignedTask,
} from '@deps/models/case/task-instance';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { searchUsersInGroupCSR } from '@deps/queries/api/server/fga/searchUsers';
import { unassignTask } from '@deps/queries/api/v1/task';
import {
    assignTaskAsAdmin,
    unAssignTaskAsAdmin,
} from '@deps/queries/api/v1/task-admin';
import { getTaskInstance } from '@deps/queries/api/v2/task';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as BanIcon } from '@deps/styles/elements/icons/content/ban.svg';
import { ReactComponent as Progress } from '@deps/styles/elements/icons/icons_outlined/clipboard-list.svg';
import { ReactComponent as ToDo } from '@deps/styles/elements/icons/icons_outlined/clipboard.svg';
import { ReactComponent as Pause } from '@deps/styles/elements/icons/icons_outlined/pause.svg';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { removeFromCache } from '@deps/utils/cache';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { AssigneePopoverPositionMode } from './table-elements/assignee-popover';
import styles from './task-management-queue.module.css';
import { createCellRenderers, StickyWrap } from './task-queue-cell-renderers';
import { Column, ColumnIds } from './task-queue-columns';
import TaskQueueDrawer from './task-queue-drawer';

type TaskQueueTableRowProps = {
    task: AssignedTask | UnassignedTask;
    featureFlagDecisions: FeatureFlags;
    tabIndex?: number;
    getTasks: (handleLoader: boolean) => void;
    setErrorMessage: (message: string) => void;
    isOpsManagerView?: boolean;
    manageTableAfterAction?: any;
    setTaskDetails?: any;
    visibleColumns?: Column<AssignedTask | UnassignedTask>[];
    openPopoverTaskId: string | null;
    setOpenPopoverTaskId: (id: string | null) => void;
};

const PROCESSOR_ROLE = 'processor';
export const OPS_MANAGER_VIEW_TASK = 'opsManagerView-task';

export type StatusItem = {
    label: string;
    icon: React.ReactNode;
    onSelect: () => void;
};

const TaskQueueTableRow = ({
    task,
    featureFlagDecisions,
    getTasks,
    setErrorMessage,
    isOpsManagerView,
    manageTableAfterAction,
    visibleColumns,
    openPopoverTaskId,
    setOpenPopoverTaskId,
}: TaskQueueTableRowProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagementQueue',
    });
    const router = useRouter();
    const [_timer] = useState(performance.now());
    const [actionLoader, setActionLoader] = useState(false);
    const [assigneeList, setAssigneeList] = useState<
        { user: string; partyId: string }[]
    >([]);
    const [allAssigneeList, setAllAssigneeList] = useState<
        { user: string; partyId: string }[]
    >([]);
    const [assigneeLoading, setAssigneeLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const [_loader, setLoader] = useState(false);
    const { taskType: _taskType, status: _status, carrier } = task;
    const carrierName =
        getCarrierNameByClientId(carrier) || carrier?.toUpperCase();

    const handleUnassignTask = async (taskId: string) => {
        setActionLoader(true);
        const taskData = await getTaskInstance({ taskId });
        setLoader(true);

        if (!taskData) {
            browserLogInfo(
                'task-queue:handleUnassignTask::Error retrieving a task',
                { taskId }
            );
            router.push(
                `/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`
            );
            return;
        }

        try {
            const response = await unassignTask(taskData.id);
            if (response.status === TaskStatus.New) {
                removeFromCache('getTaskInstance', { taskId });
                browserLogInfo(
                    'task-queue:handleUnassignTask::Successfully un-assigned task',
                    { taskId }
                );
                setActionLoader(false);
                getTasks(true);
            } else {
                browserLogInfo(
                    'task-queue:handleUnassignTask::An error occurred while un-assigning the task',
                    {
                        taskId,
                        status: (response as any)?.status,
                    }
                );
                setErrorMessage(
                    t('unassignTaskError') +
                        'An error occurred while un-assigning the task'
                );
                setLoader(false);
            }
        } catch (e) {
            setLoader(false);
            browserLogError(
                'task-queue:handleUnassignTask::Error un-assigning task',
                {
                    ...parseErrorInformation(e),
                    taskId,
                    caseId: (taskData as any).caseId,
                }
            );
            router.push(
                `/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`
            );
            return;
        }
    };

    const sideSheet = useSideSheetContext();
    const openSideSheet = () => {
        const content = (
            <TaskQueueDrawer
                onClose={sideSheet.onClose}
                taskId={task.id}
                taskStatus={task.status}
                taskName={task.taskName}
                getTasks={() => {
                    getTasks(true);
                }}
            />
        );
        sideSheet.changeSideSheetContent(
            t('updateTaskStatusDrawer.updateTaskStatus'),
            content
        );
        sideSheet.handleOpen(true);
    };

    const handleTaskClaimSuccess = () => {
        getTasks(true);
    };

    const handleTaskAssignAsAdmin = async (
        taskId: string,
        assigneePartyId: string
    ) => {
        try {
            setErrorMessage('');
            setActionLoader(true);
            const updatedTask = await assignTaskAsAdmin(
                taskId,
                assigneePartyId
            );
            if (updatedTask) {
                const result = await manageTableAfterAction(
                    taskId,
                    assigneePartyId,
                    updatedTask
                );
                if (result) setActionLoader(false);
            } else {
                setActionLoader(false);
                setErrorMessage(t('assignTaskError'));
            }
        } catch (error) {
            setActionLoader(false);
            setErrorMessage(t('assignTaskError'));
        }
    };

    const handleTaskUnassignAsAdmin = async (
        taskId: string,
        assigneePartyId: string
    ) => {
        try {
            setActionLoader(true);
            setErrorMessage('');
            const updatedTask = await unAssignTaskAsAdmin(
                taskId,
                assigneePartyId
            );
            if (updatedTask) {
                const result = await manageTableAfterAction(
                    taskId,
                    null,
                    updatedTask
                );
                if (result) setActionLoader(false);
            } else {
                setActionLoader(false);
                setErrorMessage(t('unassignTaskError'));
            }
        } catch {
            setActionLoader(false);
        }
    };

    const updateRow = (updatedTask: any) => {
        manageTableAfterAction(
            task.id,
            updatedTask.assigneePartyId,
            updatedTask
        );
    };

    const handleClick = async () => {
        if (assigneeList.length === 0 && !assigneeLoading) {
            try {
                setAssigneeLoading(true);
                const usersData = await searchUsersInGroupCSR({
                    carrier: task.carrier,
                    queue: task.queue,
                    access: PROCESSOR_ROLE,
                });

                const mappedUsers =
                    usersData?.users.map((u: any) => ({
                        user: getUserNameFromEmail(u.email),
                        partyId: u.id.split(':')[1],
                    })) || [];

                setAllAssigneeList(mappedUsers);
                setAssigneeList(mappedUsers);
            } catch (error) {
                browserLogError('Error fetching assignee list');
            } finally {
                setAssigneeLoading(false);
            }
        }
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);

        if (!value.trim()) {
            setAssigneeList(allAssigneeList);
            return;
        }

        setAssigneeList(
            allAssigneeList.filter((a) =>
                a.user.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    const openTaskSideSheet = () => {
        if (task) {
            const { taskName = '', id } = task;
            sideSheet.changeSideSheetContent(
                `${
                    taskName
                        ? `${t('sideSheet.task.heading')}: ${toSentenceCase(
                              taskName
                          )}`
                        : t('sideSheet.task.heading')
                }`,
                <GlobalTaskSideSheet
                    type={isOpsManagerView ? OPS_MANAGER_VIEW_TASK : 'case'}
                    featureFlagDecisions={featureFlagDecisions}
                    taskId={id}
                    taskDescription={task?.taskDetails}
                    onTaskClaimSuccess={handleTaskClaimSuccess}
                    onTaskUpdated={updateRow}
                />,
                true
            );
            sideSheet.handleOpen(true);
        }
    };

    const statuses: StatusItem[] = [
        {
            label: 'Scheduled',
            icon: <Pause width={16} height={16} />,
            onSelect: () => openSideSheet(),
        },
    ];

    let badgeIcon, badgeVariant, badgeLabel;
    switch (task.status) {
        case TaskStatus.Completed:
            badgeIcon = <CircleCheckIcon height={16} width={16} />;
            badgeVariant = BadgeVariant.Success;
            badgeLabel = 'Completed';
            break;
        case TaskStatus.Canceled:
            badgeIcon = <BanIcon height={16} width={16} />;
            badgeVariant = BadgeVariant.Inactive;
            badgeLabel = 'Canceled';
            break;
        case TaskStatus.InProgress:
            badgeIcon = <Progress height={16} width={16} />;
            badgeVariant = BadgeVariant.Info;
            badgeLabel = 'In Progress';
            break;
        case TaskStatus.Closed:
            badgeIcon = <CancelIcon height={16} width={16} />;
            badgeVariant = BadgeVariant.Urgent;
            badgeLabel = 'Closed';
            break;
        case TaskStatus.Scheduled:
            (badgeIcon = <Pause width={16} height={16} />),
                (badgeVariant = BadgeVariant.Error);
            badgeLabel = 'Scheduled';
            break;
        default:
            badgeIcon = <ToDo height={16} width={16} />;
            badgeVariant = BadgeVariant.Default;
            badgeLabel = 'To do';
    }

    const hasAssignee = () => !task.assignee?.includes(NO_ASSIGNEE);

    const getTimeText = useCallback(
        (field?: string) => {
            const { unit, count } =
                getTimeAgoUnitValue(
                    field ? field : new Date().toDateString()
                ) || {};
            return t('temporal.timeago', {
                formattedDate: '',
                count,
                unit,
            }).trim();
        },
        [t]
    );

    const INTERACTIVE_SELECTORS = ['a', 'button', '[role="button"]'].join(',');

    const handleRowActivate = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;

        if (target.closest(INTERACTIVE_SELECTORS)) {
            return;
        }

        openTaskSideSheet();
    };

    const handleRowKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.currentTarget !== event.target) {
            return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openTaskSideSheet();
        }
    };

    const handleOpenTask = (e?: React.MouseEvent | React.KeyboardEvent) => {
        e?.preventDefault();
        openTaskSideSheet();
    };

    const handleEnterKey =
        (handler: (e?: React.KeyboardEvent) => void) =>
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handler(e);
            }
        };

    const onAssigneeClose = useCallback(() => {
        setOpenPopoverTaskId(null);
        setSearchValue('');
        setAssigneeList(allAssigneeList);
    }, [
        setOpenPopoverTaskId,
        setSearchValue,
        setAssigneeList,
        allAssigneeList,
    ]);

    const showBadge =
        task.escalated &&
        task.status !== TaskStatus.Canceled &&
        task.status !== TaskStatus.Completed;

    const AssigneeFallback = (
        <div className={styles.assigneeFallback}>
            {hasAssignee() ? (
                <>
                    <Avatar
                        className={styles.avatar}
                        name={task.assignee || ''}
                        size="small"
                    />

                    <Content
                        className={styles.assigneeContent}
                        contentClassName="text-left flex-1"
                        details={task.assignee}
                        variant={ContentVariant.BodySm}
                    />

                    <Tooltip
                        placement={TooltipPlacement.TopRight}
                        tooltipClassName={styles.tooltip}
                        triggerClassName={clsx(
                            styles.tooltipTrigger,
                            isOpsManagerView && styles.tooltipTriggerOps
                        )}
                        trigger={
                            <IconButton
                                className={styles.unassignButton}
                                onClick={() => handleUnassignTask(task.id)}
                            >
                                <CancelIcon height={18} width={18} />
                            </IconButton>
                        }
                    >
                        <span className={styles.tooltipText}>Unassign</span>
                    </Tooltip>
                </>
            ) : (
                <Content
                    details={toSentenceCase(task.assignee)}
                    variant={ContentVariant.BodySm}
                />
            )}
        </div>
    );

    const stickyClassFor = (id: string) =>
        id === ColumnIds.Task
            ? styles.stickyTaskCol
            : id === ColumnIds.Status
            ? styles.stickyStatusCol
            : undefined;

    const render = createCellRenderers({
        task,
        t,
        styles,
        carrierName,
        showBadge,
        badgeIcon,
        badgeVariant,
        badgeLabel,
        statuses,
        actionLoader,
        AssigneeComponent: isOpsManagerView ? (
            <AssigneeField
                task={task}
                isOpsManagerView={isOpsManagerView}
                isOpen={openPopoverTaskId === task.id}
                onOpen={() => setOpenPopoverTaskId(task.id)}
                onClose={onAssigneeClose}
                assigneeList={assigneeList}
                actionLoader={actionLoader}
                assigneeLoading={assigneeLoading}
                searchValue={searchValue}
                handleClick={handleClick}
                handleSearch={handleSearch}
                hasAssignee={() => !task.assignee?.includes(NO_ASSIGNEE)}
                handleTaskAssignAsAdmin={handleTaskAssignAsAdmin}
                handleTaskUnassignAsAdmin={handleTaskUnassignAsAdmin}
                positionMode={AssigneePopoverPositionMode.Table}
            />
        ) : (
            AssigneeFallback
        ),
        getTimeText,
        isOpsManagerView: !!isOpsManagerView,
    });

    //ops manager view with dynamic columns
    if (isOpsManagerView && visibleColumns && visibleColumns.length > 0) {
        return (
            <TableRow
                className={styles.row}
                onClick={handleRowActivate}
                onKeyDown={handleRowKeyDown}
                onKeyDownCapture={handleRowKeyDown}
                key={`task_queue_row_${task.id}`}
            >
                <TableCell className={styles.taskLinkContainer}>
                    <Link
                        tabIndex={0}
                        aria-label="Open task details"
                        href=""
                        className={styles.taskLink}
                        data-stop-row-activation="true"
                        onKeyDown={handleRowKeyDown}
                    >
                        {''}
                    </Link>
                </TableCell>
                {visibleColumns.map((col) => (
                    <TableCell
                        key={col.id}
                        className={clsx(stickyClassFor(col.id), 'relative')}
                        data-stop-row-activation="true"
                    >
                        {col.id === ColumnIds.Task ||
                        col.id === ColumnIds.Status
                            ? StickyWrap(styles, render[col.id]())
                            : render[col.id]()}
                    </TableCell>
                ))}
            </TableRow>
        );
    }

    //static row
    return (
        <TableRow
            className={styles.row}
            tabIndex={0}
            key={`task_queue_row_${task.id}`}
            onClick={handleRowActivate}
            onKeyDown={handleRowKeyDown}
        >
            <TableCell className={styles.taskLinkContainer}>
                <Link
                    href=""
                    tabIndex={0}
                    aria-label="Open task details"
                    onClick={handleOpenTask}
                    onKeyDown={handleEnterKey(handleOpenTask)}
                    className={styles.taskLink}
                    data-stop-row-activation="true"
                >
                    {''}
                </Link>
            </TableCell>

            <TableCell
                onClick={openTaskSideSheet}
                onKeyDown={handleEnterKey(handleOpenTask)}
                role="button"
                className="cursor-pointer"
            >
                {render.task()}
            </TableCell>

            <TableCell>{render.status()}</TableCell>

            <TableCell>{render.carrierCase()}</TableCell>

            <TableCell colSpan={2}>
                <div className="flex">
                    {actionLoader ? (
                        <div className="w-100 h-8 text-center py-4">
                            <Loader variant={LoaderVariant.CTA} />
                        </div>
                    ) : (
                        render.assignee()
                    )}
                </div>
            </TableCell>

            <TableCell>{render.createdAt()}</TableCell>
        </TableRow>
    );
};

export default TaskQueueTableRow;
