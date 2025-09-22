import { AxiosResponse } from 'axios';

import { getName } from '@deps/helpers/party-info-helpers';
import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { apiServerBaseUrl, se2ApiServerUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    LoggingContext,
    logInfo,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';

import { TaskHandler } from '../types';

interface QualityAuditReviewPayload {
    caseId: string;
    queryFields: [string, string, string];
}

type PartiesData = {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
};

type ResponsePartyType = {
    parties: {
        [key: string]: PartiesData;
    };
    partiesNotFound: unknown[];
};

const qualityAuditReviewHandler: TaskHandler<QualityAuditReviewPayload, any> = {
    getPayload: (task: ManagementTask) => ({
        caseId: task.data.txnCaseId,
        queryFields: ['firstName', 'lastName', 'email'],
    }),

    api: async (
        payload: Record<string, any>,
        accessToken: string,
        logCtx: LoggingContext
    ) => {
        logInfo('qualityAuditReviewHandler::api', {
            ...logCtx,
            parentCaseId: payload.caseId,
        });
        try {
            const { data: assigneeSummaryData } = await serverApi.get<any>(
                `${se2ApiServerUrl}/cases/${payload.caseId}/tasks/assignee-summary`,
                {
                    authorization: `Bearer ${accessToken}`,
                },
                logCtx
            );
            const uniqueAssigneePartyIds = Array.from(
                new Set(
                    assigneeSummaryData.tasks
                        .map((task: any) => task.uniqueAssigneePartyIds || [])
                        .flat()
                )
            );
            const { data: partyData } = await serverApi.post<
                any,
                AxiosResponse
            >(
                `${apiServerBaseUrl}/party/v1/parties/reference/batch-get`,
                {
                    partyIds: uniqueAssigneePartyIds,
                    fields: payload.queryFields,
                },
                {
                    authorization: `Bearer ${accessToken}`,
                },
                logCtx
            );
            return partyData;
        } catch (error) {
            logWarn('qualityAuditReview::api', {
                ...parseErrorInformation(error),
                ...logCtx,
            });
            return [];
        }
    },

    transformResponse: (
        response: ResponsePartyType,
        metadata: FormMetadata[],
        task?: ManagementTask
    ) => {
        if (task) {
            Object.assign(task, {
                data: {
                    userDetails: {
                        partyId: task?.assigneePartyId || '',
                        name: `${task?.assigneeFirstName ?? ''} ${
                            task?.assigneeLastName ?? ''
                        }`,
                    },
                    ...task.data,
                    details: {
                        ...task.data?.details,
                    },
                },
            });
        }

        const processorNameEnum = Object.values(response.parties)
            .filter((data: PartiesData) => data?.firstName || data?.lastName)
            .map((data: PartiesData) => {
                return {
                    name: getName({
                        firstName: data?.firstName,
                        lastName: data?.lastName,
                    }),
                    partyId: data?.id,
                };
            });

        if (metadata[0]?.formSchema?.definitions) {
            metadata[0].formSchema.definitions.processorDetails = {
                enum: processorNameEnum,
            };
        }

        if (
            metadata[0]?.uiSchema?.auditDetails?.items.processorDetails?.[
                'ui:options'
            ]
        ) {
            // Using a safe approach to avoid optional chaining in assignment
            const metadataItem = metadata[0];
            if (
                metadataItem &&
                metadataItem.uiSchema &&
                metadataItem.uiSchema.auditDetails &&
                metadataItem.uiSchema.auditDetails.items.processorDetails
            ) {
                metadataItem.uiSchema.auditDetails.items.processorDetails[
                    'ui:options'
                ] = {
                    enumNames: processorNameEnum.map((item) => item.name),
                };
            }
        }
    },
};

export default qualityAuditReviewHandler;
