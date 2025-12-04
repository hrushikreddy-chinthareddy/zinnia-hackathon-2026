import { TaskType } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { updateCaseTask } from '@deps/operations/tasks/task-operations';
import { browserLogInfo } from '@deps/utils/browser-logging';

import { assigneeChangePayloadUtils } from './task-handlers/payload-utils/assignee-change-payload-utils';

export const updateTask = async (
    task: ManagementTask,
    correlationId: string,
    taskStatus?: TaskStatus
): Promise<boolean> => {
    if (task.taskType === TaskType.Initiate_AssigneeChange_Transaction) {
        const updatedData = assigneeChangePayloadUtils({ task });

        task = {
            ...task,
            data: updatedData,
        };

        browserLogInfo('updateTask::Updating assignee change task', {
            payload: {
                taskType: task.taskType,
                carrier: task.carrier,
                processType: task.process,
                taskId: task.id,
            },
        });
        const taskResponse = await updateCaseTask(task, taskStatus);
        return !!taskResponse;
    }

    browserLogInfo('updateTask::Updating task', {
        payload: {
            taskType: task.taskType,
            carrier: task.carrier,
            processType: task.process,
            taskId: task.id,
        },
    });
    const taskResponse = await updateCaseTask(task, taskStatus);
    if (!taskResponse) {
        return false;
    }
    return true;
};
