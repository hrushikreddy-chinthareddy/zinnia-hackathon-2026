import { FormMetadata, TaskType } from '@deps/models/case/task';
import {
    MatchingCase,
    PotentialMatches,
} from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask } from '@deps/models/case/task-instance';

export const buildTaskPayload = (
    task: ManagementTask,
    initialTask: ManagementTask
) => {
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
            if (
                ![MatchingCase.REINDEX].includes(correlationId) &&
                duplicateCase
            ) {
                matchingResult = duplicateCase;

                const potentialMatch = initialTask.data.potentialMatches?.find(
                    (item: PotentialMatches) =>
                        item.correlationid === correlationId
                );

                const matchData =
                    potentialMatch ||
                    task.data?.transactionOptions?.find(
                        (item: any) => item.value === task.data?.transactions
                    )?.subElement ||
                    task.data;

                const entityType = matchData?.entityType;
                const recordId = matchData?.recordId;
                const zlCaseId = matchData?.zlCaseId ?? task?.data?.zlCaseId;
                const policyNumber =
                    matchData?.policyNumber ?? task?.data?.policyNumber;

                const paymentRecordId = task?.data?.transactions ?? null;

                updateTask;
                updateTask = {
                    ...task,
                    data: {
                        ...task.data,
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

            if (
                ![MatchingCase.NO_MATCH, MatchingCase.NOT_APPLICABLE].includes(
                    correlationId
                )
            ) {
                const potentialMatch = initialTask.data.potentialMatches?.find(
                    (item: PotentialMatches) =>
                        item.correlationid === correlationId
                );

                if (correlationId === MatchingCase.ENTERED) {
                    matchedData = {
                        zlCaseId: task.data?.caseId ?? '',
                        policyNumber: task.data?.policyNumber ?? '',
                    };
                } else {
                    const {
                        entityType,
                        recordId,
                        zlCaseId,
                        policyNumber,
                        taskId,
                        firstName,
                        lastName,
                    } = potentialMatch;
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
            const {
                attachments,
                caseOverview,
                matchCaseId,
                matchedCaseId,
                ...filteredData
            } = task.data ?? {};

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
    const removeOmittedProperties = (
        schema: any,
        data: any,
        parentPath: string[] = []
    ) => {
        Object.keys(schema).forEach((key) => {
            if (key.includes('ui')) return;
            const currentPath = [...parentPath, key];
            const options = schema[key]?.['ui:options'];

            if (Array.isArray(data?.[key]) && schema[key]?.items) {
                data[key].forEach((item: any) => {
                    removeOmittedProperties(schema[key].items, item, []);
                });
            }

            if (options?.omitValue) {
                let target = data;
                for (let i = 0; i < parentPath.length; i++) {
                    const currentKey = parentPath[i];
                    // if key with omitValue is present in an array,
                    // delete the key from all objects in the array and exit
                    if (currentKey === 'items') {
                        for (const item of target) {
                            delete item[key];
                        }
                        return;
                    }
                    // Traverse deeper into the object/array
                    target = target?.[currentKey];
                    if (!target) return;
                }
                // If traversal completed and target exists, delete the key
                if (target) delete target[key];
            } else if (
                typeof schema[key] === 'object' &&
                schema[key] !== null
            ) {
                removeOmittedProperties(schema[key], data, currentPath);
            }
        });
    };

    removeOmittedProperties(taskMetadata.uiSchema, formData.data || formData);
    return formData;
};
