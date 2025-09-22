import { getName } from '@deps/helpers/party-info-helpers';
import {
    AuditDetail,
    AuditItem,
    FormMetadata,
    UserDetails,
} from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { LoggingContext, logInfo } from '@deps/utils/server-logging';

import { TaskHandler } from '../types';

const attachNewAuditItem = (
    workId: string,
    auditDetail: AuditDetail,
    userDetails: UserDetails
) => {
    if (!auditDetail.auditData) {
        auditDetail.auditData = [];
    }

    auditDetail.auditData?.push({
        workId,
        histricalData: false,
        userDetails,
        note: '',
    } as AuditItem);
};

const qualityReworkAuditReviewHandler: TaskHandler<any, any> = {
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
        if (task?.data?.auditDetails) {
            const userDetails = {
                partyId: task.assigneePartyId || '',
                name: getName({
                    firstName: task?.assigneeFirstName,
                    lastName: task?.assigneeLastName,
                }),
            };

            logInfo('qualityReworkAuditReviewHandler::transformResponse', {
                processorDetails: userDetails,
                correlationId: logCtx?.correlationId || '',
                inputs: logCtx?.inputs || {},
                file: 'quality-rework-audit-review.ts',
                function: 'transformResponse',
                method: 'transformResponse',
                page: 'quality-rework-audit-review',
                params: {},
                referrer: logCtx?.referrer || '',
                url: logCtx?.url || '',
                user: logCtx?.user || undefined,
                ...logCtx,
            });
            const updatedAuditDetails = task.data.auditDetails?.map(
                (detail: AuditDetail) => {
                    if (!detail.historicalAuditDetails) {
                        detail.historicalAuditDetails = [];
                    }

                    detail.historicalAuditDetails.push(
                        ...(detail.auditData ?? [])
                    );

                    task.status !== TaskStatus.Completed
                        ? attachNewAuditItem(
                              task.data.workId,
                              detail,
                              userDetails
                          )
                        : null;
                    return detail;
                }
            );

            Object.assign(task, {
                data: {
                    ...task.data,
                    auditDetails: updatedAuditDetails,
                    userDetails,
                    workId: task.data.workId ?? '',
                },
            });
        }
    },
};

export default qualityReworkAuditReviewHandler;
