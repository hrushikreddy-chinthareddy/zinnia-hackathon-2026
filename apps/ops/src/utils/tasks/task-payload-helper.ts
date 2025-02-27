import { TaskType } from '@deps/models/case/task';
import { MatchingCase, PotentialMatches } from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask } from '@deps/models/case/task-instance';

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

                const { entityType, recordId, zlCaseId, policyNumber, taskId, firstName, lastName } = potentialMatch;
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
                            taskId,
                            firstName,
                            lastName,
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
           
            if (![MatchingCase.NO_MATCH, MatchingCase.ENTERED].includes(correlationId)) {

                const potentialMatch = initialTask.data.potentialMatches?.find(
                    (item: PotentialMatches) => item.correlationid === correlationId
                );

                const { entityType, recordId, zlCaseId, policyNumber, taskId, firstName, lastName } = potentialMatch;

                let matchedDocumentData = task.data?.matchedDocumentData ?? {};


                updateTask;
                updateTask = {
                    ...task,
                    data: {
                        details: { ...task.data.details },
                        matchingResult: MatchingCase.MATCH_FOUND,
                        matchedDocumentData,
                        matchedData: {
                            entityType,
                            recordId,
                            zlCaseId,
                            policyNumber,
                            taskId,
                            firstName,
                            lastName,
                        },
                    },
                };
            }
            return updateTask;

        }
        default:
            return task;
    }
};
