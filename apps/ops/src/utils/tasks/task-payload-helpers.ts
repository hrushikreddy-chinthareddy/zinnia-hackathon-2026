import { normalizeFormData } from '@deps/containers/task-container/components/steps/task-form/task-form.utils';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { FormMetadata, TaskType } from '@deps/models/case/task';
import { MatchingCase, PotentialMatches } from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';

import { browserLogError } from '../browser-logging';
import { parseErrorInformation } from '../server-logging';

export const buildTaskPayload = (task: ManagementTask, initialTask: ManagementTask) => {
    let updateTask = { ...task };
    switch (task.taskType) {
        case TaskType.PURCHASE_DOCUMENT_MATCHING: {
            const correlationId = task.data.matchingResult;
            const duplicateCase = task.data.isDuplicate;

            let matchingResult = correlationId;
            // reindexing case
            if (correlationId === MatchingCase.REINDEX) {
                matchingResult = MatchingCase.REINDEX;
            }

            // match found & duplicate case
            if (![MatchingCase.REINDEX].includes(correlationId) && duplicateCase) {
                matchingResult = duplicateCase;

                const potentialMatch = initialTask.data.potentialMatches?.find(
                    (item: PotentialMatches) => item.correlationid === correlationId
                );

                const matchData =
                    potentialMatch ||
                    task.data?.transactionOptions?.find((item: any) => item.value === task.data?.transactions)?.subElement ||
                    task.data;

                const entityType = matchData?.entityType;
                const recordId = matchData?.recordId;
                const zlCaseId = matchData?.zlCaseId ?? task?.data?.zlCaseId;
                const policyNumber = matchData?.policyNumber ?? task?.data?.policyNumber;

                const paymentRecordId = task?.data?.transactions ?? null;

                updateTask;
                updateTask = {
                    ...task,
                    data: {
                        details: { ...task.data.details },
                        matchingResult,
                        matchedData: {
                            entityType,
                            recordId,
                            zlCaseId,
                            policyNumber,
                            linkedData: {
                                paymentRecordId: paymentRecordId,
                            },
                        },
                    },
                };
            }

            return {
                ...task,
                ...updateTask,
            };
        }
        case TaskType.Standard_Document_Matching: {
            const correlationId = task.data.matchingResult;
            let matchedData = {};
            let matchingResult = task?.data?.matchingResult;

            if (![MatchingCase.NO_MATCH].includes(correlationId)) {
                const potentialMatch = initialTask.data.potentialMatches?.find(
                    (item: PotentialMatches) => item.correlationid === correlationId
                );

                if (correlationId === MatchingCase.ENTERED) {
                    matchedData = {
                        zlCaseId: task.data?.caseId ?? '',
                        policyNumber: task.data?.policyNumber ?? '',
                    };
                } else {
                    const { entityType, recordId, zlCaseId, policyNumber, taskId, firstName, lastName } = potentialMatch;
                    matchedData = {
                        entityType,
                        recordId,
                        zlCaseId,
                        policyNumber,
                        taskId,
                        firstName,
                        lastName,
                    };
                }

                matchingResult = MatchingCase.MATCH_FOUND;
            }

            const attachment = task.data?.attachments?.slice(-1) ?? [];
            let matchedDocumentData = task.data?.matchedDocumentData ?? {};
            if (matchedDocumentData && attachment.length > 0) {
                matchedDocumentData = {
                    ...matchedDocumentData,
                    existingDocumentId: attachment[0]?.documentId,
                };
            }
            const { attachments, caseOverview, matchCaseId, matchedCaseId, ...filteredData } = task.data ?? {};

            updateTask = {
                ...task,
                data: {
                    ...filteredData,
                    matchingResult,
                    matchedDocumentData,
                    matchedData,
                },
            };

            return updateTask;
        }
        default:
            return task;
    }
};

/**
 * Cleans form data by removing properties marked for omission in the UI schema
 */

export const cleanForm = (formData: any, taskMetadata: FormMetadata) => {
    const finalFormData = normalizeFormData(formData);
    const iterableProperties = Object.keys(taskMetadata.uiSchema).filter((metadata: string) => !metadata.includes('ui'));
    iterableProperties.forEach(property => {
        if ((taskMetadata.uiSchema?.[property]?.['ui:options'] || {})?.omitValue) {
            finalFormData.data ? delete finalFormData.data[property] : delete finalFormData[property];
        }
    });
    return finalFormData;
};

export const attachFilesToMappedDocuments = async (attachment: any, task: ManagementTask, correlationId: string): Promise<boolean> => {
    try {
        await updateTask(
            {
                ...task,
                mappedDocuments: [...(task.mappedDocuments || []), attachment],
            },
            correlationId,
            TaskStatus.InProgress
        );
    } catch (error) {
        browserLogError('updateTask::Error updating mapped documents to task', {
            ...parseErrorInformation(error),
            taskId: task.id,
        });
        return false;
    }
    return true;
};
