import { TableRow, TableCell } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { getTaskStatus } from '@deps/components/tasks-listing/task-listing.helpers';
import { TranslationFiles } from '@deps/config/translations';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { CaseIdentifier } from '@deps/models/case/case';
import { AssignedTask, TaskStatus } from '@deps/models/case/task-instance';
import { ERROR_CODES } from '@deps/pages/create-case/error';
import { getTaskInstance, updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as SparklesIcon } from '@deps/styles/elements/icons/icons_outlined/sparkles.svg';
import { getCarrierNameByClientId } from '@deps/utils/carriers';

type TaskQueueTableRowProps = {
    task: AssignedTask;
};

const TaskQueueTableRow = ({ task }: TaskQueueTableRowProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });
    const router = useRouter();
    const [timer] = useState(performance.now());

    const createdAt = task.createdAt ? dayjs(task.createdAt).format('MMM DD, YYYY h:mm a') : '-';
    const taskStatus = getTaskStatus(t, task.status);
    const documentNumber= getCaseIdentifierValue(task.identifiers, CaseIdentifier.DocumentNumber);
    const carrierName = getCarrierNameByClientId(task?.carrier) || task?.carrier?.toUpperCase();
    const transactionType = task.process || '';

    const handleStartTask = async (taskId: string, taskStatus: TaskStatus ) => {
        if (taskStatus === TaskStatus.InProgress) {
            router.push(`/nigo-entry?taskId=${taskId}`);
            return;
        }

        const taskData = await getTaskInstance({ taskId: taskId});
        if (!taskData) {
            router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
            return;
        }

        const body = {...taskData, status: TaskStatus.New}
        const response = await updateTask(
            taskData.caseId,
            taskData.id,
            body,
            timer
        );

        if (response) {
            router.push(`/nigo-entry?taskId=${taskData.id}`);
        } else {
            console.error('TaskQueue::Error updating task in progress', {taskId: taskData.id, caseId:taskData.caseId});
            router.push(`/create-case/error?errorCode=${ERROR_CODES.DATA_ENTRY_START_TASK_ERROR}`);
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
                        details={t('startTask') as string}
                        variant={ContentVariant.BodySm}
                        onClick={() => handleStartTask(task?.id, task?.status)}
                        className="mouse-pointer"
                    />
                </a>
            </TableCell>
        </TableRow>
    );
}

export default TaskQueueTableRow;
