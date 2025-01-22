import { TableRow, TableCell } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { getTaskStatus } from '@deps/components/tasks-listing/task-listing.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { ProcessesToCaseTypeMap } from '@deps/constants/case';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { CaseIdentifier, Processes } from '@deps/models/case/case';
import { ProcessType } from '@deps/models/case/enums';
import { EarlyTaskType, TaskSource, TaskType } from '@deps/models/case/task';
import { AssignedTask, TaskStatus } from '@deps/models/case/task-instance';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { unassignTask } from '@deps/queries/api/v1/task';
import { getTaskInstance, updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as SparklesIcon } from '@deps/styles/elements/icons/icons_outlined/sparkles.svg';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';
import { isFormFeatureEnabled } from '@deps/utils/optimizely/utils';
import { parseErrorInformation } from '@deps/utils/server-logging';

type TaskQueueTableRowProps = {
    task: AssignedTask;
    featureFlagDecisions: FeatureFlags;
    getTasks: () => void;
    setErrorMessage: (message: string) => void;
};

const TaskQueueTableRow = ({ task, featureFlagDecisions, getTasks, setErrorMessage }: TaskQueueTableRowProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });
    const router = useRouter();
    const [timer] = useState(performance.now());

    const createdAt = task.createdAt ? dayjs(task.createdAt).format('MMM DD, YYYY h:mm a') : '-';
    const taskStatus = getTaskStatus(t, task.status);
    const documentNumber = getCaseIdentifierValue(task.identifiers, CaseIdentifier.DocumentNumber);
    const carrierName = getCarrierNameByClientId(task?.carrier) || task?.carrier?.toUpperCase();
    const transactionType = task.process || '';

    const handleStartTask = async (taskId: string, taskStatus: TaskStatus, taskType: string) => {
        const newTask = !Object.values(EarlyTaskType).includes(taskType as EarlyTaskType);
        if (taskStatus === TaskStatus.InProgress) {
            browserLogInfo('task-queue:handleStartTask::Task is in progress', {
                taskId: taskId,
                taskStatus: taskStatus,
            });
            router.push(newTask ? `/task/${taskId}` : `/nigo-entry?taskId=${taskId}`);
            return;
        }

        const taskData = await getTaskInstance({ taskId: taskId });
        if (!taskData) {
            browserLogInfo('task-queue:handleStartTask::handleStartTask::Error retrieving a task', {
                taskId: taskId,
                taskStatus: taskStatus,
            });
            router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
            return;
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

        try {
            const body = { ...taskData, status: TaskStatus.InProgress, source: TaskSource.ZinniaTaskManagement };
            const response = await updateTask(taskData.caseId, taskData.id, body, timer);

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
            browserLogError('task-queue:handleStartTask::Error updating task in progress', {
                ...parseErrorInformation(e),
                taskId: taskId,
                caseId: taskData.caseId,
            });
            router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
            return;
        }
    };
    const handleUnassignTask = async (taskId: string) => {
        const taskData = await getTaskInstance({ taskId: taskId });
        if (!taskData) {
            browserLogInfo('task-queue:handleUnassignTask::Error retrieving a task', { taskId: taskId });
            router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
            return;
        }

        try {
            const response = await unassignTask(taskData.caseId, taskData.id);
            if (response.status === TaskStatus.New) {
                browserLogInfo('task-queue:handleUnassignTask::Successfully un-assigned task', { taskId: taskId });
                getTasks();
            } else {
                browserLogInfo('task-queue:handleUnassignTask::An error occurred while un-assigning the task', {
                    taskId: taskId,
                    status: response?.status,
                });
                setErrorMessage(t('unassignTaskError') + 'An error occurred while un-assigning the task');
            }
        } catch (e) {
            browserLogError('task-queue:handleUnassignTask::Error un-assigning task', {
                ...parseErrorInformation(e),
                taskId: taskId,
                caseId: taskData.caseId,
            });
            router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
            return;
        }
    };

    return (
        <TableRow key={`task_queue_row_${task.id}`}>
            <TableCell>
                <div className="flex">
                    <SparklesIcon height={45} width={45} className="p-1 text-primary" />
                    <div>
                        <Content details={t('transaction', { transactionType }) as string} variant={ContentVariant.BodySm} />
                        <Content details={t('caseId') + task?.caseId} variant={ContentVariant.BodySm} />
                        <Content details={t('documentNumber') + documentNumber} variant={ContentVariant.BodySm} />
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Content details={carrierName} variant={ContentVariant.BodySm} />
            </TableCell>
            <TableCell>
                <Content details={task?.process} variant={ContentVariant.BodySm} />
            </TableCell>
            <TableCell>
                <Content details={taskStatus} variant={ContentVariant.BodySm} />
            </TableCell>
            <TableCell>
                <Content details={createdAt} variant={ContentVariant.BodySm} />
            </TableCell>
            <TableCell>
                <a className="text-blue-600 hover:cursor-pointer">
                    <Content
                        details={t('unassignTask') as string}
                        variant={ContentVariant.BodySm}
                        onClick={() => handleUnassignTask(task?.id)}
                        className="mouse-pointer"
                    />
                </a>
            </TableCell>
            <TableCell>
                <a className="text-blue-600 hover:cursor-pointer">
                    <Content
                        details={t('startTask') as string}
                        variant={ContentVariant.BodySm}
                        onClick={() => handleStartTask(task?.id, task?.status, task?.taskType)}
                        className="mouse-pointer"
                    />
                </a>
            </TableCell>
        </TableRow>
    );
};

export default TaskQueueTableRow;
