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
    const taskResponse = await updateCaseTask(task, taskStatus);
    if (!taskResponse) {
        return false;
    }
    return true;
};
