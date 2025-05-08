import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { updateCaseTask } from '@deps/operations/tasks/task-operations';

export const updateTask = async (task: ManagementTask, correlationId: string, taskStatus?: TaskStatus): Promise<boolean> => {
    const taskResponse = await updateCaseTask(task, taskStatus);
    if (!taskResponse) {
        return false;
    }
    return true;
};
