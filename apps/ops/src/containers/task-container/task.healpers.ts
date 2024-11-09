import { TaskType } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { uploadDocument } from '@deps/queries/api/documents';

export const processDocuments = (task: ManagementTask) => {
    switch (task.taskType as TaskType) {
        case TaskType.SuitabilityReview: {
            const attachments: [] = task.data?.attachment;
            attachments?.forEach((attachment: any) => {
                const document = uploadDocument(task, attachment.attachmentFile);
            });
        }
    }
};
