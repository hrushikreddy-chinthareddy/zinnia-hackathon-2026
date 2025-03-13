import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { logError, logInfo, parseErrorInformation } from '@deps/utils/server-logging';

export type ClaimNextTask = {
    id: string;
    caseId: string;
    source: string;
    templateId: string;
    process: string;
    carrier: string;
    taskType: string;
    taskName: string;
    status: string;
    queue: string;
    data?: any;
    escalated: boolean;
    assignee: string;
    assignedAt: string;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
};

export const claimNextTask = async () => {
    try {
        const url = `${baseAppUrl}/api/case/v1/tasks/assignments`;
        const data = await client.post(url);
        logInfo('claimNextTask::Task is claimed successfully', { file: 'queries/api/v1/claimTask', function: 'claimNextTask', url });
        return data;
    } catch (error: any) {
        logError('claimNextTask::Something went wrong while claiming task', {
            ...parseErrorInformation(error),
            file: 'queries/api/v1/claimTask',
            function: 'claimNextTask',
        });
        return error;
    }
};
