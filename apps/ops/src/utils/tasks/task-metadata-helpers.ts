import { v4 as uuidv4 } from 'uuid';

import {
    CaseIdentifierType,
    FormMetadata,
    TaskType,
} from '@deps/models/case/task';
import {
    MatchingCase,
    TransactionData,
} from '@deps/models/case/task/doc-matching-payment';
import { TaskStatus } from '@deps/models/case/task-instance';
import { searchTransactionsSSR } from '@deps/queries/api/transaction-search';

import { LoggingContext, logWarn } from '../server-logging';

export const TaskMetadataHelper = async (
    task: any,
    tasksMetadata: any[],
    accessToken: string,
    loggingContext: LoggingContext
) => {
    const updatedMetadata = await Promise.all(
        tasksMetadata.map(async (taskMetadata: FormMetadata) => {
            if (task?.status === TaskStatus.Completed) {
                taskMetadata.uiSchema = {
                    ...taskMetadata.uiSchema,
                    'ui:readonly': true,
                };
            }
            switch (task.taskType) {
                case TaskType.PURCHASE_DOCUMENT_MATCHING:
                case TaskType.Standard_Document_Matching: {
                    const potentialMatchCriteria =
                        task.data?.potentialMatchCriteria;

                    try {
                        const response = await searchTransactionsSSR(
                            potentialMatchCriteria ?? {},
                            accessToken,
                            loggingContext
                        );
                        const potentialMatches =
                            response && response.length > 0
                                ? generatePotentialMatchesOptions(
                                      response as TransactionData[],
                                      potentialMatchCriteria?.status || []
                                  )
                                : [];

                        const uiSchema = taskMetadata.uiSchema || {};

                        if (
                            uiSchema.matchingResult?.['ui:options']
                                ?.customOptions
                        ) {
                            const existingOptions = uiSchema.matchingResult[
                                'ui:options'
                            ].customOptions
                                .filter((option: any) => {
                                    if (
                                        option.value ===
                                            MatchingCase.NO_MATCH &&
                                        !task?.data?.isPrimaryDocumentPresent ==
                                            true
                                    ) {
                                        return false;
                                    }
                                    return true;
                                })
                                .map((option: any) => {
                                    if (option.value === undefined) {
                                        return { ...option, value: null };
                                    }
                                    return option;
                                });

                            const potentialMatchesOptions =
                                potentialMatches || [];

                            uiSchema.matchingResult[
                                'ui:options'
                            ].customOptions = [
                                ...potentialMatchesOptions,
                                ...existingOptions,
                            ];
                        }
                    } catch (error: any) {
                        logWarn(
                            'taskMetadataHelper:: Error in TaskMetadataHelper',
                            {
                                ...error,
                                loggingContext,
                            }
                        );
                    }
                    return taskMetadata;
                }

                default:
                    return taskMetadata;
            }
        })
    );

    return updatedMetadata;
};

const generatePotentialMatchesOptions = (
    potentialMatches: TransactionData[],
    allowedStatus: string[]
): any[] => {
    const getCaseId = (item: TransactionData) =>
        item.identifiers?.find(
            (id: { identifier: string }) =>
                id.identifier === CaseIdentifierType.ZL_CASE_ID
        )?.value;

    return (
        potentialMatches
            ?.filter((item) => {
                const zlCaseId = getCaseId(item);
                return (
                    zlCaseId &&
                    item.correlationId &&
                    item.correlationId !== '' &&
                    (!allowedStatus.length ||
                        allowedStatus.includes(item.entity?.status || ''))
                );
            })
            ?.map((item: TransactionData) => {
                const id = uuidv4();
                const zlCaseId = getCaseId(item);
                const subElement = {
                    label: '',
                    value: zlCaseId ?? '',
                    title: item?.entityType ?? '',
                    url: `/cases/${zlCaseId}`,
                    type: 'link',
                    disabled: false,
                };
                return {
                    label: item.entityType,
                    value: item.correlationId,
                    id,
                    subElement,
                };
            }) || []
    );
};
