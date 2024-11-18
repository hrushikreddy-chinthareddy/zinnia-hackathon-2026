import { TaskType } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { uploadDocument } from '@deps/queries/api/documents';

export const processDocuments = (task: ManagementTask): boolean => {
    let success = true;
    switch (task.taskType as TaskType) {
        case TaskType.SuitabilityReview: {
            const attachments: [] = task.data?.attachment;
            if (attachments?.length === 0) return true;
            attachments?.forEach(async (attachment: any) => {
                if (!attachment.attachmentFile) return;
                const document = await uploadDocument(task, attachment.attachmentFile);
                if (document?.success) {
                    attachment.documentId = document?.documentId;
                } else {
                    success = false;
                }
            });
        }
    }
    return success;
};
