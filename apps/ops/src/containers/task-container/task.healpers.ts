import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { updateCaseTask } from '@deps/operations/tasks/task-operations';
import { buildTaskPayload } from '@deps/utils/tasks/task-payload-helper';

export const updateTask = async (task: ManagementTask, correlationId: string, taskStatus?: TaskStatus): Promise<boolean> => {
    const processedTask = buildTaskPayload(task, task);
    const taskResponse = await updateCaseTask(processedTask, taskStatus ?? TaskStatus.Completed);
    return !!taskResponse;
};
