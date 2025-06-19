import { TableRow, TableCell, Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
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
import GlobalTaskSideSheet from '@deps/components/side-sheet/task-details-sidesheet/global-task-sidesheet-content';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { getTimeAgoUnitValue } from '@deps/hooks/useStatusInfo';
import { CaseIdentifier } from '@deps/models/case/case';
import { EarlyTaskType } from '@deps/models/case/task';
import { AssignedTask, TaskStatus, UnassignedTask } from '@deps/models/case/task-instance';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { unassignTask } from '@deps/queries/api/v1/task';
import { getTaskInstance } from '@deps/queries/api/v2/task';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { ReactComponent as BanIcon } from '@deps/styles/elements/icons/content/ban.svg';
import { ReactComponent as Progress } from '@deps/styles/elements/icons/icons_outlined/clipboard-list.svg';
import { ReactComponent as ToDo } from '@deps/styles/elements/icons/icons_outlined/clipboard.svg';
import { ReactComponent as Pause } from '@deps/styles/elements/icons/icons_outlined/pause.svg';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { removeFromCache } from '@deps/utils/cache';
import { getCarrierNameByClientId, getCarrierLogoByClientId } from '@deps/utils/carriers';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { NO_ASSIGNEE } from './task-management-queue-container';
import styles from './task-management-queue.module.css';
import TaskQueueDrawer from './task-queue-drawer';

type TaskQueueTableRowProps = {
    task: AssignedTask | UnassignedTask;
    featureFlagDecisions: FeatureFlags;
    tabIndex?: number;
    getTasks: (handleLoader: boolean) => void;
    setErrorMessage: (message: string) => void;
};

const TaskQueueTableRow = ({ task, getTasks, setErrorMessage }: TaskQueueTableRowProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });
    const router = useRouter();
    const [_timer] = useState(performance.now());
    const policyNumber = getCaseIdentifierValue(task.identifiers, CaseIdentifier.PolicyNumber);
    const _documentNumber = getCaseIdentifierValue(task.identifiers, CaseIdentifier.DocumentNumber);

    const [_loader, setLoader] = useState(false);
    const { taskName, taskType: _taskType, createdAt, status: _status, carrier, assignee, process } = task;
    const carrierName = getCarrierNameByClientId(carrier) || carrier?.toUpperCase();

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

    const handleTaskClaimSuccess = () => {
        getTasks(true);
    };

    const openTaskSideSheet = () => {
        if (task) {
            const { taskName = '', id } = task;
            sideSheet.changeSideSheetContent(
                `${taskName ? `${t('sideSheet.task.heading')}: ${toSentenceCase(taskName)}` : t('sideSheet.task.heading')}`,
                <GlobalTaskSideSheet taskId={id} taskDescription={task?.taskDetails} onTaskClaimSuccess={handleTaskClaimSuccess} />
            );
            sideSheet.handleOpen(true);
        }
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
        case TaskStatus.Pending:
            (badgeIcon = <Pause width={16} height={16} />), (badgeVariant = BadgeVariant.Error);
            badgeLabel = 'Pending';
            break;
        default:
            badgeIcon = <ToDo width={16} height={16} />;
            badgeVariant = BadgeVariant.Default;
            badgeLabel = 'To do';
            break;
    }

    const hasAssignee = () => {
        return !assignee?.includes(NO_ASSIGNEE);
    };

    const getTimeText = () => {
        let text;
        const { unit, count } = getTimeAgoUnitValue(createdAt as string) || {};
        const timeText = t('temporal.timeago', { formattedDate: '', count: count, unit: unit }).trim();
        text = timeText;
        return text;
    };

    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement> | undefined) => {
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

    return (
        <TableRow className={styles.row} key={`task_queue_row_${task.id}`}>
            <TableCell className={styles.taskLinkContainer}>
                {/* This lives as a visibly hidden link instead of as a click handler on the table row for
                 acccessibility concerns. Nested interactive elements are not allowed */}
                <Link href="" onClick={handleLinkClick} onKeyDown={handleLinkKeyDown} className={styles.taskLink}>
                    {''}
                </Link>
            </TableCell>
            <TableCell>
                <Content details={toSentenceCase(taskName)} variant={ContentVariant.BodySm} />
                <Content className={styles.fadedText} details={toSentenceCase(process)} variant={ContentVariant.BodySm} />
            </TableCell>
            <TableCell>
                {task?.status === TaskStatus.InProgress &&
                task?.queue &&
                !Object.values(EarlyTaskType).includes(task?.taskType as EarlyTaskType) ? (
                    <div className="z-5">
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
            </TableCell>

            <TableCell>
                <div className="flex">
                    <div className="flex justify-center items-center rounded border-1 border-gray-100 bg-white h-6 w-6 mr-2">
                        <Image src={getCarrierLogoByClientId(carrier)} alt={`${carrier} icon`} role="presentation" height={16} width={16} />
                    </div>
                    <div>
                        <Content details={carrierName} variant={ContentVariant.BodySm} />
                        <div className="flex items-center min-w-0 w-full">
                            <Typography className="flex-[1_1_auto] truncate" variant={TypographyVariant.BodySm}>
                                {t('policy')}
                            </Typography>
                            {policyNumber ? (
                                <NextLink
                                    className="relative z-5 text-secondary hover-[--color-base-text-text-secondary] hover:underline hover:decoration-2 hover:underline-offset-2"
                                    href={`/policies?policyNumber=${policyNumber}`}
                                >
                                    {policyNumber}
                                </NextLink>
                            ) : (
                                <Content className={'text-secondary pl-1'} details={'-'} variant={ContentVariant.BodySm} />
                            )}
                        </div>
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
                            triggerClassName="!z-10 focus:outline-none"
                            trigger={
                                <span
                                    tabIndex={0}
                                    aria-label="Unassign Task"
                                    className="text-secondary cursor-pointer"
                                    onClick={() => handleUnassignTask(task?.id)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleUnassignTask(task?.id);
                                        }
                                    }}
                                >
                                    <CancelIcon height={18} width={18} />
                                </span>
                            }
                        >
                            <span className="text-md">{t('unassign')}</span>
                        </Tooltip>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <Typography variant={TypographyVariant.BodySm} className={styles.fadedText}>
                    {getTimeText()}
                </Typography>
            </TableCell>
        </TableRow>
    );
};

export default TaskQueueTableRow;
