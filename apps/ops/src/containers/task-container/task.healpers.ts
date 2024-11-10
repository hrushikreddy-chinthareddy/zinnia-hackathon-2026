import { TaskType } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { Policy } from '@deps/models/policy/sor-policy';
import { uploadDocument } from '@deps/queries/api/documents';

export const processDocuments = (task: ManagementTask, policy: Policy): boolean => {
    let success = true;
    switch (task.taskType as TaskType) {
        case TaskType.SuitabilityReview: {
            const attachments: [] = task.data?.attachment;
            attachments?.forEach(async (attachment: any) => {
                const document = await uploadDocument(task, policy, attachment.attachmentFile);
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
