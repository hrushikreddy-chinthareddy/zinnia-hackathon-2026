import { useState } from 'react';

import { ActionTypes } from '@deps/models/case/task';
import { TaskDocument } from '@deps/models/case/task-instance';
import { browserLogError } from '@deps/utils/browser-logging';

interface UseAttachmentsProps {
    initialFiles?: TaskDocument[] | TaskDocument | null;
    multiple: boolean;
    onChange: (value: TaskDocument[] | TaskDocument | null) => void;
    formContext?: any;
}

interface UseAttachmentsReturn {
    attachments: TaskDocument[];
    handleSetAttachments: (
        currentAttachment: TaskDocument,
        operationType?: ActionTypes
    ) => void;
}

export const useAttachments = ({
    initialFiles,
    multiple = false,
    onChange,
    formContext,
}: UseAttachmentsProps): UseAttachmentsReturn => {
    // Normalize initial files (handle array or single item)
    const normalizeInitial = (): TaskDocument[] => {
        if (!initialFiles) return [];
        return Array.isArray(initialFiles) ? initialFiles : [initialFiles];
    };

    // Initialize with normalized files
    const [attachments, setAttachments] = useState<TaskDocument[]>(
        normalizeInitial()
    );
    const handleSetAttachments = (
        currentAttachment: TaskDocument,
        operationType?: ActionTypes
    ) => {
        if (!currentAttachment || !currentAttachment.documentId) {
            browserLogError(
                'useAttachments: Invalid attachment:',
                currentAttachment
            );
            return;
        }

        let updatedAttachments: TaskDocument[];

        if (operationType === ActionTypes.Remove) {
            updatedAttachments = attachments.filter(
                (item) => item.documentId !== currentAttachment.documentId
            );
        } else {
            // Avoid adding duplicates
            const exists = attachments.some(
                (item) => item.documentId === currentAttachment.documentId
            );
            updatedAttachments = multiple
                ? exists
                    ? attachments
                    : [...attachments, currentAttachment]
                : [currentAttachment];
        }

        setAttachments(updatedAttachments);
        onChange(multiple ? updatedAttachments : updatedAttachments[0] || null);
        updateFormContext(currentAttachment, operationType);
    };

    const updateFormContext = (
        attachments: TaskDocument,
        operationType?: ActionTypes
    ) => {
        if (!formContext) return;
        if (formContext?.setMappedDocuments) {
            formContext.setMappedDocuments((oldAttachments: TaskDocument[]) => {
                if (operationType === ActionTypes.Remove) {
                    return oldAttachments?.map((item) =>
                        item.documentId === attachments.documentId
                            ? { ...item, OperationType: ActionTypes.Remove }
                            : item
                    );
                } else {
                    return [...oldAttachments, attachments];
                }
            });
        }
    };

    return {
        attachments,
        handleSetAttachments,
    };
};
