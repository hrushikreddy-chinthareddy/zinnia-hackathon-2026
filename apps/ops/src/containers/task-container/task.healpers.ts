import { ManagementTask } from '@deps/models/case/task-instance';

export const updateTask = async (task: ManagementTask, correlationId: string): Promise<boolean> => {
    console.log('🚀 ~ updateTask ~ task:', task);
    // const taskResponse = await updateCaseTask(task);
    // if (!taskResponse) {
    //     return false;
    // }
    return true;
};
