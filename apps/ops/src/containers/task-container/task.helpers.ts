import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { updateCaseTask } from '@deps/operations/tasks/task-operations';
import { browserLogInfo } from '@deps/utils/browser-logging';

export const updateTask = async (
    task: ManagementTask,
    correlationId: string,
    taskStatus?: TaskStatus
): Promise<boolean> => {
    browserLogInfo('updateTask::Updating task', {
        payload: {
            taskType: task.taskType,
            carrier: task.carrier,
            processType: task.process,
            taskId: task.id,
        },
    });

    if (task.taskType === 'THIRD_PARTY_DETAIL') {
        let index = 0;
        const { partyData, ...restData } = task.data;
        if (task.data.requestType == 'ADD') {
            index = partyData.length - 1;
        }
        const updatedTask = {
            ...task,
            data: {
                ...restData,
                ...partyData[index],
            },
        };
        task = updatedTask;
    }

    const taskResponse = await updateCaseTask(task, taskStatus);
    if (!taskResponse) {
        return false;
    }
    return true;
};
