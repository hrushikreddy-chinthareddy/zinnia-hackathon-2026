import { TaskType } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';

export const buildTaskPayload = (task: ManagementTask) => {
    switch (task.taskType) {
        case TaskType.PURCHASE_DOCUMENT_MATCHING: {
            //todo: modify the payload for potentialMatches
            return task;
        }
        default:
            return task;
    }
};
