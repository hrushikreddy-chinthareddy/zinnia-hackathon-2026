import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { browserLogInfo, browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export const assignTaskAsAdmin = async (
    taskId: string,
    assigneePartyId: string
): Promise<any> => {
    try {
        const url = `${baseAppUrl}/api/case/v1/admin/tasks/${taskId}/assignee`;
        const { data } = await client.put<any>(url, {
            taskId,
            assigneePartyId,
        });

        browserLogInfo('Assigning task as admin', {
            taskId,
            assigneePartyId,
            url,
            function: 'tasks.assignTaskAsAdmin',
        });
        return data;
    } catch (error: any) {
        browserLogError('An error occurred assigning the task', {
            ...parseErrorInformation(error),
            error,
            taskId,
            function: 'tasks.assignTaskAsAdmin',
        });
        return error?.data;
    }
};

export const unAssignTaskAsAdmin = async (
    taskId: string,
    assigneePartyId: string
): Promise<any> => {
    try {
        const url = `${baseAppUrl}/api/case/v1/admin/tasks/${taskId}/assignee`;
        const { data } = await client.delete<any>(url, {
            data: { assigneePartyId },
        });

        browserLogInfo('Un-assigning task as admin', {
            taskId,
            assigneePartyId,
            url,
            function: 'tasks.unAssignTaskAsAdmin',
        });
        return data;
    } catch (error: any) {
        browserLogError('An error occurred un-assigning the task', {
            ...parseErrorInformation(error),
            error,
            taskId,
            function: 'tasks.unAssignTaskAsAdmin',
        });
        return error?.data;
    }
};
