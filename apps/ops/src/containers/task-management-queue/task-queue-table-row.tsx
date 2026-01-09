import {
    TableRow,
    TableCell,
    Tooltip,
    TooltipPlacement,
    Loader,
    LoaderVariant,
} from '@zinnia/bloom/components';
import Image from 'next/image';
import { default as NextLink, default as Link } from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Avatar from '@deps/components/avatar/avatar';
import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import Content, { ContentVariant } from '@deps/components/content/content';
import Dropdown from '@deps/components/dropdown/Dropdown';
import IconButton from '@deps/components/icon-button/icon-button';
import NavLink from '@deps/components/nav-element/nav-link/nav-link';
import { AssigneeField } from '@deps/components/side-sheet/task-details-sidesheet/components/assignee-field';
import GlobalTaskSideSheet from '@deps/components/side-sheet/task-details-sidesheet/global-task-sidesheet-content';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
import {
    getUserNameFromEmail,
    NO_ASSIGNEE,
} from '@deps/hooks/useTaskManagementQueue';
import { EarlyTaskType } from '@deps/models/case/task';
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
import { ReactComponent as Warning } from '@deps/styles/elements/icons/alert/warning.svg';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as BanIcon } from '@deps/styles/elements/icons/content/ban.svg';
import { ReactComponent as Progress } from '@deps/styles/elements/icons/icons_outlined/clipboard-list.svg';
import { ReactComponent as ToDo } from '@deps/styles/elements/icons/icons_outlined/clipboard.svg';
import { ReactComponent as Pause } from '@deps/styles/elements/icons/icons_outlined/pause.svg';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { removeFromCache } from '@deps/utils/cache';
import {
    getCarrierNameByClientId,
    getCarrierLogoByClientId,
} from '@deps/utils/carriers';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import { parseErrorInformation } from '@deps/utils/server-logging';

import styles from './task-management-queue.module.css';
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
};

const PROCESSOR_ROLE = 'processor';
export const OPS_MANAGER_VIEW_TASK = 'opsManagerView-task';

const TaskQueueTableRow = ({
    task,
    featureFlagDecisions,
    getTasks,
    setErrorMessage,
    isOpsManagerView,
    manageTableAfterAction,
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

        const taskData = await getTaskInstance({ taskId: taskId });

        setLoader(true);

        if (!taskData) {
            browserLogInfo(
                'task-queue:handleUnassignTask::Error retrieving a task',
                { taskId: taskId }
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
                    { taskId: taskId }
                );
                setActionLoader(false);
                getTasks(true);
            } else {
                browserLogInfo(
                    'task-queue:handleUnassignTask::An error occurred while un-assigning the task',
                    {
                        taskId: taskId,
                        status: response?.status,
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
                    taskId: taskId,
                    caseId: taskData.caseId,
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
                if (result) {
                    setActionLoader(false);
                }
            } else {
                setActionLoader(false);
                setErrorMessage(t('assignTaskError'));
            }
        } catch (error) {
            setActionLoader(false);
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
                if (result) {
                    setActionLoader(false);
                }
            } else {
                setActionLoader(false);
                setErrorMessage(t('unassignTaskError'));
            }
        } catch (error) {
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

    const statuses = [
        {
            label: 'Scheduled',
            icon: <Pause width={16} height={16} />,
            onSelect: () => {
                openSideSheet();
            },
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
            badgeIcon = <Progress width={16} height={16} />;
            badgeVariant = BadgeVariant.Info;
            badgeLabel = 'In Progress';
            break;
        case TaskStatus.Closed:
            badgeIcon = <CancelIcon width={16} height={16} />;
            badgeVariant = BadgeVariant.Urgent;
            badgeLabel = 'Closed';
            break;
        case TaskStatus.Scheduled:
            (badgeIcon = <Pause width={16} height={16} />),
                (badgeVariant = BadgeVariant.Error);
            badgeLabel = 'Scheduled';
            break;
        default:
            badgeIcon = <ToDo width={16} height={16} />;
            badgeVariant = BadgeVariant.Default;
            badgeLabel = 'To do';
            break;
    }

    const hasAssignee = () => {
        return !task.assignee?.includes(NO_ASSIGNEE);
    };

    const getTimeText = (field: string | undefined) => {
        let text = '';
        const { unit, count } =
            getTimeAgoUnitValue(field ? field : new Date().toDateString()) ||
            {};
        const timeText = t('temporal.timeago', {
            formattedDate: '',
            count: count,
            unit: unit,
        }).trim();
        text = timeText;
        return text;
    };

    const handleLinkClick = (
        event: React.MouseEvent<HTMLElement> | undefined
    ) => {
        if (event) {
            event.preventDefault();
        }
        openTaskSideSheet();
    };

    const handleLinkKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleLinkClick(undefined);
        }
    };
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
                        triggerClassName={styles.tooltipTrigger}
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

    return (
        <TableRow className={styles.row} key={`task_queue_row_${task.id}`}>
            <TableCell className={styles.taskLinkContainer}>
                <Link
                    href=""
                    onClick={handleLinkClick}
                    onKeyDown={handleLinkKeyDown}
                    className={styles.taskLink}
                >
                    {''}
                </Link>
            </TableCell>
            <TableCell>
                <NavLink onClick={handleLinkClick}>
                    <Content
                        contentClassName="relative z-0"
                        triggerClassName="text-left"
                        truncate={true}
                        details={toSentenceCase(task.taskName)}
                        variant={ContentVariant.BodySm}
                    />
                    <Content
                        truncate={true}
                        contentClassName="relative z-0"
                        triggerClassName="text-left"
                        className={`${styles.fadedText} truncate w-full`}
                        details={toSentenceCase(task.process)}
                        variant={ContentVariant.BodySm}
                    />
                </NavLink>
            </TableCell>
            <TableCell>
                {task?.status === TaskStatus.InProgress &&
                task?.queue &&
                !isOpsManagerView &&
                !Object.values(EarlyTaskType).includes(
                    task?.taskType as EarlyTaskType
                ) ? (
                    <div
                        className={`relative ${
                            isOpsManagerView ? 'z-10' : 'z-0'
                        }`}
                    >
                        {task?.status === TaskStatus.InProgress && (
                            <Dropdown
                                triggerIcon={
                                    <div className="pb-1">
                                        <Progress width={16} height={16} />
                                    </div>
                                }
                                triggerLabel="In Progress"
                                options={statuses}
                            />
                        )}
                    </div>
                ) : (
                    <Badge
                        icon={badgeIcon}
                        variant={badgeVariant}
                        label={badgeLabel}
                        rounded={true}
                        className="flex gap-1 items-center min-w-max"
                    />
                )}
            </TableCell>
            <TableCell>
                <div className="flex">
                    <div className="flex justify-center items-center rounded border-1 border-gray-100 bg-white h-6 w-6 mr-2">
                        <Image
                            src={getCarrierLogoByClientId(task.carrier)}
                            alt={`${task.carrier} icon`}
                            role="presentation"
                            height={16}
                            width={16}
                        />
                    </div>
                    <div>
                        <Content
                            details={carrierName}
                            variant={ContentVariant.BodySm}
                        />
                        <div className="flex items-center min-w-0 w-full">
                            <Typography
                                className="flex-[1_1_auto] truncate"
                                variant={TypographyVariant.BodySm}
                            >
                                {t('caseId')}
                            </Typography>
                            {task.caseId ? (
                                <NextLink
                                    className="relative z-5 text-secondary hover-[--color-base-text-text-secondary] hover:underline hover:decoration-2 hover:underline-offset-2 ml-1"
                                    href={`/cases/${task.caseId}`}
                                >
                                    {task.caseId}
                                </NextLink>
                            ) : (
                                <Content
                                    className={'text-secondary pl-1'}
                                    details={'-'}
                                    variant={ContentVariant.BodySm}
                                />
                            )}
                            {showBadge && (
                                <div>
                                    <Tooltip
                                        placement={TooltipPlacement.TopRight}
                                        tooltipClassName="!w-auto"
                                        triggerClassName="!z-10  justify-end"
                                        trigger={
                                            <Warning
                                                height={16}
                                                width={16}
                                                className="ml-2"
                                            />
                                        }
                                    >
                                        <span className="text-md">
                                            {t('prioritized')}
                                        </span>
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </TableCell>
            <TableCell colSpan={2}>
                <div className={isOpsManagerView ? 'w-full block' : 'flex'}>
                    {actionLoader ? (
                        <div className="w-100 h-8 text-center py-4">
                            <Loader variant={LoaderVariant.CTA} />
                        </div>
                    ) : isOpsManagerView ? (
                        <AssigneeField
                            task={task}
                            isOpsManagerView={isOpsManagerView}
                            assigneeList={assigneeList}
                            assigneeLoading={assigneeLoading}
                            searchValue={searchValue}
                            handleClick={handleClick}
                            handleSearch={handleSearch}
                            hasAssignee={() =>
                                !task.assignee?.includes(NO_ASSIGNEE)
                            }
                            handleTaskAssignAsAdmin={handleTaskAssignAsAdmin}
                            handleTaskUnassignAsAdmin={
                                handleTaskUnassignAsAdmin
                            }
                            positionMode="table"
                        />
                    ) : (
                        AssigneeFallback
                    )}
                </div>
            </TableCell>
            <TableCell>
                <Typography
                    variant={TypographyVariant.BodySm}
                    className={styles.fadedText}
                >
                    {getTimeText(task.createdAt)}
                </Typography>
            </TableCell>
            {isOpsManagerView ? (
                <TableCell>
                    <Typography
                        variant={TypographyVariant.BodySm}
                        className={styles.fadedText}
                    >
                        {getTimeText(task.updatedAt)}
                    </Typography>
                </TableCell>
            ) : null}
        </TableRow>
    );
};

export default TaskQueueTableRow;
