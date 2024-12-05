import { dataURItoBlob } from '@rjsf/utils';
import dayjs from 'dayjs';

import { TaskType } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { uploadDocument } from '@deps/queries/api/documents';
import { DEFAULT_DATE_DISPLAY_FORMAT } from '@deps/types/constants';

export const processPayload = (task: ManagementTask): boolean => {
    let success = true;
    switch (task.taskType as TaskType) {
        case TaskType.SuitabilityReview: {
            const attachments: [] = task.data?.attachment;
            if (attachments?.length === 0) return true;
            attachments?.forEach(async (attachment: any) => {
                if (!attachment.attachmentFile) return;
                const document = await uploadDocument(task, attachment.attachmentFile);
                const { blob } = dataURItoBlob(attachment.attachmentFile);
                if (document?.success) {
                    attachment.documentId = document?.documentId;
                    attachment.documentType = blob.type;
                    attachment.uploadedOn = dayjs().format(DEFAULT_DATE_DISPLAY_FORMAT);
                    attachment.attachmentFile = '';
                } else {
                    success = false;
                }
            });
        }
    }
    return success;
};
