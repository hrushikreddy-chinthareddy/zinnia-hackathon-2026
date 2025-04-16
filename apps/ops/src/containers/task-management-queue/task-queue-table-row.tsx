import { TableRow, TableCell, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Avatar from '@deps/components/avatar/avatar';
import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helper';
import { SupportedTaskMap } from '@deps/components/case-sub-page/case-tabs/progress/tasks';
import Content, { ContentVariant } from '@deps/components/content/content';
import Dropdown from '@deps/components/dropdown/Dropdown';
import IconButton from '@deps/components/icon-button/icon-button';
import { Loader } from '@deps/components/page-loader';
import { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { getTaskStatus } from '@deps/components/tasks-listing/task-listing.helpers';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { ProcessesToCaseTypeMap } from '@deps/constants/case';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { toSentenceCase } from '@deps/helpers/string.helper';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
import { CaseIdentifier, Processes } from '@deps/models/case/case';
import { ProcessType } from '@deps/models/case/enums';
import { EarlyTaskType, TaskSource, TaskType } from '@deps/models/case/task';
import { AssignedTask, ManagementTask, TaskStatus, UnassignedTask } from '@deps/models/case/task-instance';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { claimTask, unassignTask } from '@deps/queries/api/v1/task';
import { getTaskInstance, updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as BanIcon } from '@deps/styles/elements/icons/content/ban.svg';
import { ReactComponent as Progress } from '@deps/styles/elements/icons/icons_outlined/clipboard-list.svg';
import { ReactComponent as Pause } from '@deps/styles/elements/icons/icons_outlined/pause.svg';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { removeFromCache } from '@deps/utils/cache';
import { getCarrierNameByClientId, getCarrierLogoByClientId } from '@deps/utils/carriers';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { NO_ASSIGNEE } from './task-management-queue-container';
import TaskQueueDrawer from './task-queue-drawer';
import { isProd } from '@deps/utils/environment.helper';

import styles from './task-management-queue.module.css';

type TaskQueueTableRowProps = {
    task: AssignedTask | UnassignedTask;
    featureFlagDecisions: FeatureFlags;
    tabIndex?: number;
    getTasks: (handleLoader: boolean) => void;
    setErrorMessage: (message: string) => void;
};

const TaskQueueTableRow = ({ task, featureFlagDecisions, tabIndex, getTasks, setErrorMessage }: TaskQueueTableRowProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });
    const router = useRouter();
    const [timer] = useState(performance.now());
    const policyNumber = getCaseIdentifierValue(task.identifiers, CaseIdentifier.PolicyNumber);
    const documentNumber = getCaseIdentifierValue(task.identifiers, CaseIdentifier.DocumentNumber);

    const [loader, setLoader] = useState(false);
    const { taskName, taskType, createdAt, status, carrier, assignee, process } = task;
    const taskStatus = getTaskStatus(t, status);
    const carrierName = getCarrierNameByClientId(carrier) || carrier?.toUpperCase();

    const handleStartTask = async (taskId: string, taskStatus: TaskStatus, taskType: string) => {
        if (!loader) {
            setLoader(true);
        }
        const newTask = !Object.values(EarlyTaskType).includes(taskType as EarlyTaskType);

        const taskData = await getTaskInstance({ taskId: taskId });

        const updateTaskStatus = async (taskData: ManagementTask) => {
            try {
                const body = { ...taskData, status: TaskStatus.InProgress, source: TaskSource.ZinniaTaskManagement };
                const response = await updateTask(taskData.caseId, taskData.id, body, timer);

                removeFromCache('getTaskInstance', { taskId: task.id });
                if (response) {
                    browserLogInfo('task-queue:handleStartTask::Successfully updated task in progress', {
                        taskId: taskData.id,
                        documentNumber: taskData?.data?.documentNumber,
                        clientCode: taskData?.carrier,
                        process: taskData?.process,
                    });
                    router.push(newTask ? `/task/${taskData.id}` : `/nigo-entry?taskId=${taskData.id}`);
                    return;
                }
            } catch (e) {
                setLoader(false);
                browserLogError('task-queue:handleStartTask::Error updating task in progress', {
                    ...parseErrorInformation(e),
                    taskId: taskData?.id,
                    caseId: taskData.caseId,
                });
                router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
                return;
            }
        };

        if (!taskData) {
            browserLogInfo('task-queue:handleStartTask::handleStartTask::Error retrieving a task', {
                taskId: taskId,
                taskStatus: taskStatus,
            });
            router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
            return;
        }

        try {
            if (TaskStatus.InProgress) {
                browserLogInfo('task-queue:handleStartTask::Task is in progress', {
                    taskId: taskId,
                    taskStatus: taskStatus,
                });
                router.push(newTask ? `/task/${taskId}` : `/nigo-entry?taskId=${taskId}`);
                return;
            }
            if (TaskStatus.New && newTask) {
                await updateTaskStatus(taskData);
                return;
            }
        } catch (e) {
            browserLogError('task-queue:handleStartTask::Error updating task status');
        }

        const caseType = ProcessesToCaseTypeMap[taskData.process as Processes];
        if (!caseType) {
            browserLogInfo('task-queue:handleStartTask::Error getting case type', {
                taskId: taskData.id,
                documentNumber: taskData?.data?.documentNumber,
                clientCode: taskData?.carrier,
                process: taskData?.process,
            });
            router.push(`/create-case/error?errorCode=${ERROR_CODES.CASE_TYPE_RETRIEVAL_ERROR}`);
            return;
        }

        // If feature flag is not enabled, redirect to error page
        if (
            caseType.toUpperCase() !== 'RMD' &&
            !isFormFeatureEnabled(
                newTask ? (taskType as TaskType) : (caseType.toUpperCase() as ProcessType),
                taskData?.carrier,
                featureFlagDecisions
            )
        ) {
            browserLogInfo('task-queue:handleStartTask::Feature flag not enabled', {
                taskId: taskData.id,
                documentNumber: taskData?.data?.documentNumber,
                clientCode: taskData?.carrier,
                process: taskData?.process,
            });
            router.push(`/403`);
            return;
        }

        updateTaskStatus(taskData);
    };
    const handleUnassignTask = async (taskId: string) => {
        const taskData = await getTaskInstance({ taskId: taskId });

        setLoader(true);

        if (!taskData) {
            browserLogInfo('task-queue:handleUnassignTask::Error retrieving a task', { taskId: taskId });
            router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
            return;
        }

        try {
            const response = await unassignTask(taskData.id);
            if (response.status === TaskStatus.New) {
                removeFromCache('getTaskInstance', { taskId });
                browserLogInfo('task-queue:handleUnassignTask::Successfully un-assigned task', { taskId: taskId });
                getTasks(true);
            } else {
                browserLogInfo('task-queue:handleUnassignTask::An error occurred while un-assigning the task', {
                    taskId: taskId,
                    status: response?.status,
                });
                setErrorMessage(t('unassignTaskError') + 'An error occurred while un-assigning the task');
                setLoader(false);
            }
        } catch (e) {
            setLoader(false);
            browserLogError('task-queue:handleUnassignTask::Error un-assigning task', {
                ...parseErrorInformation(e),
                taskId: taskId,
                caseId: taskData.caseId,
            });
            router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
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
        sideSheet.changeSideSheetContent(t('updateTaskStatusDrawer.updateTaskStatus'), content);
        sideSheet.handleOpen(true);
    };
    const statuses = [
        {
            label: 'Pending',
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
        case TaskStatus.Pending:
            (badgeIcon = <Pause width={16} height={16} />), (badgeVariant = BadgeVariant.Error);
            badgeLabel = 'Pending';
            break;
        default:
            badgeIcon = <Progress width={16} height={16} />;
            badgeVariant = BadgeVariant.Default;
            badgeLabel = 'To do';
            break;
    }

    const handleAssignToMe = async (task: UnassignedTask) => {
        setErrorMessage('');
        setLoader(true);
        try {
            const result = await claimTask(task?.id);
            if (result.status === 200 && result?.data?.statusCode !== 400) {
                handleStartTask(task?.id, task?.status, taskType);
            } else {
                setErrorMessage(t('assignTaskError') + 'An error occurred while unassigning the task');
            }
        } catch (e) {
            setLoader(false);
            setErrorMessage(t('assignTaskError') + 'An error occurred while unassigning the task');
            browserLogError('task-queue:handleUnassignTask::Error un-assigning task', {
                ...parseErrorInformation(e),
                taskId: task?.id,
                caseId: task?.caseId,
            });
            return;
        }
    };

    const hasAssignee = () => {
        return !assignee?.includes(NO_ASSIGNEE);
    };

    const getTimeText = () => {
        let text;
        const { unit, count } = getTimeAgoUnitValue(createdAt) || {};
        const timeText = t('temporal.timeago', { formattedDate: '', count: count, unit: unit }).trim();
        text = timeText;
        return text;
    };

    return (
        <TableRow className={styles.row} key={`task_queue_row_${task.id}`}>
            <TableCell className={styles.taskLinkContainer}>
                {/* This lives as a visibly hidden link instead of as a click handler on the table row for
                 acccessibility concerns. Nested interactive elements are not allowed */}
                <Link
                    onClick={() => (hasAssignee() ? handleStartTask(task?.id, task?.status, taskType) : handleAssignToMe(task))}
                    onKeyDown={(event: React.KeyboardEvent) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            hasAssignee() ? handleStartTask(task?.id, task?.status, taskType) : handleAssignToMe(task);
                        }
                    }}
                    href={
                        !Object.values(EarlyTaskType).includes(taskType as EarlyTaskType)
                            ? `/task/${task?.id}`
                            : `/nigo-entry?taskId=${task?.id}`
                    }
                    className={styles.taskLink}
                >
                    {''}
                </Link>
            </TableCell>
            <TableCell>
                <Content details={toSentenceCase(taskName)} variant={ContentVariant.BodySm} />
                <Content className={styles.fadedText} details={toSentenceCase(process)} variant={ContentVariant.BodySm} />
                {!isProd() && <Content details={`${t('documentNumber')} ${documentNumber || '-'}`} variant={ContentVariant.BodySm} />}
            </TableCell>
            <TableCell>
                {SupportedTaskMap.includes(task?.taskType as TaskType) ? (
                    <>
                        <div className="relative z-100">
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
                        {task?.status !== TaskStatus.InProgress && (
                            <Typography variant={TypographyVariant.BodySm} className="py-2 pr-6 ">
                                <Badge
                                    icon={badgeIcon}
                                    variant={badgeVariant}
                                    label={badgeLabel}
                                    rounded={true}
                                    className="flex gap-1 items-center"
                                />
                            </Typography>
                        )}
                    </>
                ) : (
                    <Content details={taskStatus} variant={ContentVariant.BodySm} />
                )}
            </TableCell>

            <TableCell>
                <div className="flex">
                    <div className="flex justify-center items-center rounded border-1 border-gray-100 bg-white h-6 w-6 mr-2">
                        <Image src={getCarrierLogoByClientId(carrier)} alt={`${carrier} icon`} role="presentation" height={16} width={16} />
                    </div>
                    <div>
                        <Content details={carrierName} variant={ContentVariant.BodySm} />
                        <Content className="text-secondary" details={policyNumber || '-'} variant={ContentVariant.BodySm} />
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex">
                    <div className={`flex items-center mr-2`}>
                        {hasAssignee() && <Avatar name={assignee || ''} size="small" />}
                        {hasAssignee() ? (
                            <Content
                                details={
                                    assignee
                                        ?.split(',')
                                        .map((x: string) => x.trim())
                                        .reverse()
                                        .join(' ') || ''
                                }
                                variant={ContentVariant.BodySm}
                            />
                        ) : (
                            <Content details={toSentenceCase(assignee)} variant={ContentVariant.BodySm} />
                        )}
                    </div>
                    {hasAssignee() && (
                        <Tooltip
                            placement={TooltipPlacement.TopRight}
                            tooltipClassName="!w-auto"
                            triggerClassName="!z-10"
                            trigger={
                                <IconButton
                                    className="text-secondary"
                                    onClick={() => {
                                        handleUnassignTask(task?.id);
                                    }}
                                >
                                    <CancelIcon height={18} width={18} />
                                </IconButton>
                            }
                        >
                            <span className="text-md">Unassign</span>
                        </Tooltip>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <Typography variant={TypographyVariant.BodySm} className={styles.fadedText}>
                    {getTimeText()}
                </Typography>
            </TableCell>
            <TableCell colSpan={2}>
                <div className="w-full text-center inline-block min-w-[150px] ">
                    {loader ? (
                        <div className="w-100 text-center">
                            <Loader variant={PageLoaderVariant.Center} />
                        </div>
                    ) : (
                        <div className="text-secondary hover:cursor-pointer">
                            <Content
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event: React.KeyboardEvent) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        hasAssignee() ? handleStartTask(task?.id, task?.status, taskType) : handleAssignToMe(task);
                                    }
                                }}
                                details={(hasAssignee() ? t('startTask') : t('assignTask')) as string}
                                variant={ContentVariant.BodySmBold}
                                onClick={() => (hasAssignee() ? handleStartTask(task?.id, task?.status, taskType) : handleAssignToMe(task))}
                                className="mouse-pointer p-1"
                            />
                        </div>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
};

export default TaskQueueTableRow;
