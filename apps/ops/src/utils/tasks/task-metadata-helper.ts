import { TaskType } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';

export const TaskMetadataHelper = (task: ManagementTask, taskMetadata: any) => {
    switch (task.taskType) {
        case TaskType.NB_LINK_PAYMENT_POLICY: {
            const options = task.data.potentialMatches.map((item: any) => {
                return { const: item.applicationId, title: item.applicationId };
            });

            taskMetadata.formSchema.definitions.potentialMatchesEnum.oneOf.unshift(...options);
            return taskMetadata;
        }
        default:
            return taskMetadata;
    }
};
