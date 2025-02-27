import { ManagementTask } from '@deps/models/case/task-instance';
import { updateCaseTask } from '@deps/operations/tasks/task-operations';



export const updateTask = async (task: ManagementTask, correlationId: string): Promise<boolean> => {
    const taskResponse = await updateCaseTask(task);
    if (!taskResponse) {
        return false;
    }
    return true;
};
