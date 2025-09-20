import { v4 as uuidV4 } from 'uuid';

import { getName } from '@deps/helpers/party-info-helpers';
import {
    AuditDetail,
    FormMetadata,
    ReworkItem,
    UserDetails,
} from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { LoggingContext, logInfo } from '@deps/utils/server-logging';

import { TaskHandler } from '../types';

const markHistoricalData = (detail: AuditDetail) => {
    if (!detail.historicalReworkDetails) {
        detail.historicalReworkDetails = [];
    }

    detail.reworkDetails?.forEach((reworkItem) => {
        detail.historicalReworkDetails?.push(reworkItem);
    });
};

const attachNewReworkItem = (
    workId: string,
    auditDetail: AuditDetail,
    userDetails: UserDetails
) => {
    if (!auditDetail.reworkDetails) {
        auditDetail.reworkDetails = [];
    }

    auditDetail.auditData?.forEach((auditItem) => {
        const exists = auditDetail.reworkDetails?.some(
            (reworkItem) => reworkItem?.auditId === auditItem.id
        );

        if (!exists) {
            auditDetail.reworkDetails?.push({
                workId,
                auditId: auditItem?.id || '',
                histricalData: false,
                userDetails,
                note: '',
            } as ReworkItem);
        }
    });
};

const transformAuditReworkDetails = (
    workId: string,
    details: AuditDetail[] = [],
    userDetails: UserDetails
): AuditDetail[] => {
    return details.map((detail) => {
        markHistoricalData(detail);
        attachNewReworkItem(workId, detail, userDetails);
        return detail;
    });
};

const qualityAuditReviewHandler: TaskHandler<any, any> = {
    getPayload: () => ({}),

    api: async () => {
        return [];
    },

    transformResponse: (
        __response: any,
        metadata: FormMetadata[],
        task?: ManagementTask,
        logCtx?: LoggingContext
    ) => {
        const loggingContext: LoggingContext = {
            correlationId: uuidV4(),
            inputs: logCtx?.inputs || {},
            file: 'quality-audit-rework.ts',
            function: 'transformResponse',
            method: 'transformResponse',
            page: 'quality-audit-rework',
            params: {},
            referrer: logCtx?.referrer || '',
            url: logCtx?.url || '',
            user: logCtx?.user || undefined,
            ...logCtx,
        };

        if (task?.data?.auditDetails) {
            const userDetails = {
                partyId: task.assigneePartyId || '',
                name: getName({
                    firstName: task.assigneeFirstName,
                    lastName: task.assigneeLastName,
                }),
            };

            logInfo('qualityAuditRework::current processor details', {
                ...loggingContext,
                processorDetails: userDetails,
            });

            const updatedAuditDetails = transformAuditReworkDetails(
                task.data.workId ?? '',
                task.data.auditDetails,
                userDetails
            );

            Object.assign(task, {
                data: {
                    workId: task.data.workId ?? '',
                    ...task.data,
                    auditDetails: updatedAuditDetails,
                    userDetails,
                },
            });
        }
    },
};

export default qualityAuditReviewHandler;
