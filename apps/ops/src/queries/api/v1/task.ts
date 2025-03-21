import { AxiosResponse } from 'axios';

import { ActiveReg60Case } from '@deps/containers/otp/reg60-forms/reg60.types';
import { ProcessType } from '@deps/models/case/enums';
import { CreateTaskBody, CreateTaskResponse, FormMetadata, TaskType, TaskV1Payload } from '@deps/models/case/task';
import { AssignedTask, ManagementTask, TaskStatus, UnassignedTask } from '@deps/models/case/task-instance';
import { ActiveWithdrawalCase, DigitalFormWithdrawal } from '@deps/models/case/withdrawal/case';
import { baseAppUrl, se2ApiServerUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { logError, LoggingContext, logInfo, parseErrorInformation } from '@deps/utils/server-logging';

const baseCasesUrl = `${baseAppUrl}/api/case/v1/cases`;
const baseTasksUrl = `${baseAppUrl}/api/case/v1/tasks`;
const ssrCasesUrl = `${se2ApiServerUrl}/cases`;
const ssrSchemaUrl = `${se2ApiServerUrl}`;

export const getCaseTasksSSR = async (
    caseId: string,
    accessToken: string,
    queryParams: { [key: string]: string } = {},
    logCtx: LoggingContext
): Promise<ActiveWithdrawalCase[]> => {
    const loggingContext = { ...logCtx, file: 'queries/api/v1/task', function: 'getCaseTasksSSR' };
    try {
        const url = new URL(`${ssrCasesUrl}/${caseId}/tasks`);
        url.search = new URLSearchParams(queryParams).toString();
        logInfo('getCaseTasksSSR', {
            ...loggingContext,
            inputs: { caseId, queryParams },
            url: url.toString(),
        });

        const { data } = await serverApi.get<{ data: ActiveWithdrawalCase[] }>(
            url.href,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return data.data;
    } catch (error: any) {
        logError('getCaseTasksSSR', {
            ...parseErrorInformation(error),
            ...loggingContext,
            inputs: { caseId, queryParams },
        });
        return [];
    }
};

export const postCaseTasksSSR = async (
    caseId: string,
    formData: DigitalFormWithdrawal,
    accessToken: string,
    logCtx: LoggingContext
): Promise<ActiveWithdrawalCase | null> => {
    const loggingContext = { ...logCtx, file: 'queries/api/v1/task', function: 'postCaseTasksSSR' };
    try {
        const url = `${ssrCasesUrl}/${caseId}/tasks`;
        logInfo('postCaseTasksSSR', {
            ...loggingContext,
            inputs: { caseId },
            file: 'queries/api/v1/task',
            function: 'postCaseTasksSSR',
            url,
        });
        const { data } = await serverApi.post<DigitalFormWithdrawal>(
            url,
            formData,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return data as ActiveWithdrawalCase;
    } catch (error: any) {
        logError('postCaseTasksSSR', { ...parseErrorInformation(error), ...loggingContext, caseId });
        return null;
    }
};

export const getCaseTaskInstances = async (query: any): Promise<ManagementTask[] | null> => {
    try {
        const { data } = await client.post<any, AxiosResponse>(`${baseTasksUrl}/search`, query);

        return data.data;
    } catch (error: any) {
        console.error('getCaseTaskInstances::An error occurred while getting case Task Instances', error);
        return error.response;
    }
};

export const createTask = async (caseId: string, query: CreateTaskBody<TaskStatus, TaskV1Payload>): Promise<CreateTaskResponse> => {
    try {
        const { data } = await client.post<CreateTaskBody<TaskStatus, TaskV1Payload>, AxiosResponse>(
            `${baseCasesUrl}/${caseId}/tasks`,
            query
        );

        return data;
    } catch (error: any) {
        console.error('createTask::An error occurred create task ', error);
        return error.response;
    }
};

export const putCaseTask = async (
    caseId: string,
    taskId: string,
    body: DigitalFormWithdrawal | ActiveReg60Case
): Promise<ActiveWithdrawalCase | ActiveReg60Case | null> => {
    try {
        const { data } = await client.put<DigitalFormWithdrawal | ActiveReg60Case, AxiosResponse<ActiveWithdrawalCase | ActiveReg60Case>>(
            `${baseCasesUrl}/${caseId}/tasks/${taskId}`,
            body
        );
        browserLogInfo('Saving a case task SSR', {
            file: 'queries/api/v1/task',
            function: 'putCaseTask',
            url: `${baseCasesUrl}/${caseId}/tasks/${taskId}`,
        });
        return data;
    } catch (error: any) {
        browserLogError('An error occurred while saving a case task', {
            error,
            caseId,
            taskId,
            file: 'queries/api/v1/task',
            function: 'putCaseTask',
        });
        return null;
    }
};

export const getCaseTasks = async (query: any): Promise<any | null> => {
    try {
        browserLogInfo('getCaseTasks', {
            caseId: query.caseId,
            file: 'queries/api/v1/task',
            function: 'getCaseTasks',
            url: `${baseAppUrl}/cases/${query.caseId}/tasks`,
        });
        const { data } = await client.get<any, AxiosResponse>(`${baseCasesUrl}/${query.caseId}/tasks`, query);
        return data?.data;
    } catch (error: any) {
        browserLogError('getCaseTasks', { error });
        return error.response;
    }
};

export const getCaseTasksByIdSSR = async (
    caseId: string,
    taskId: string,
    accessToken: string,
    logCtx: LoggingContext
): Promise<ActiveWithdrawalCase | null> => {
    const loggingContext = { ...logCtx, file: 'queries/api/v1/task', function: 'getCaseTasksByIdSSR', inputs: { caseId, taskId } };
    try {
        const url = new URL(`${ssrCasesUrl}/${caseId}/tasks/${taskId}`);
        logInfo('getCaseTasksByIdSSR', { ...loggingContext, url: url.toString() });

        const { data } = await serverApi.get<ActiveWithdrawalCase>(
            url.href,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return data;
    } catch (error: any) {
        logError('getCaseTasksByIdSSR', {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        return null;
    }
};

export const getAssignedTasks = async (): Promise<AssignedTask[] | []> => {
    try {
        const { data } = await client.post(`${baseAppUrl}/api/case/v1/tasks/assigned`);
        return data ?? [];
    } catch (error) {
        browserLogError('getAssignedTasks::Failed to retrieve unassigned tasks', {
            ...parseErrorInformation(error),
            file: 'queries/v1/tasks/assigned',
            function: 'getAssignedTasks',
        });
        return [];
    }
};

export const getTaskFormMetadataSSR = async (
    clientId: string,
    taskType: TaskType | undefined,
    processType: ProcessType | undefined,
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<FormMetadata | null> => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/v1/task',
        function: 'getTaskFormMetadataSSR',
        inputs: { clientId, taskType, processType },
    };
    try {
        const url = `${ssrSchemaUrl}/form/metadata?process=${processType}&taskType=${taskType}&carrier=${clientId.toUpperCase()}`;
        logInfo('getTaskFormMetadataSSR', {
            ...loggingContext,
            url,
        });
        const { data } = await serverApi.get<FormMetadata, AxiosResponse>(
            url,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return data as FormMetadata;
    } catch (error: any) {
        logError('getFormSchemaSSR', {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        return null;
    }
};
export const unassignTask = async (taskId: string, entryDuration?: number): Promise<any> => {
    try {
        const logTime = entryDuration ? performance.now() - entryDuration : 0;
        const timeInSeconds = ((logTime % 60000) / 1000).toFixed(0);
        const url = `${baseAppUrl}/api/case/v1/tasks/${taskId}/assignments`;
        const { data } = await client.delete<AxiosResponse>(url);

        browserLogInfo('unassignTask::Successfully unassigned task', {
            timeElapsedSinceLoad: timeInSeconds,
            taskId,
            url,
            function: 'tasks.unassignTask',
        });
        return data;
    } catch (error: any) {
        browserLogError('unassignTask::::Failed to unassign task', {
            ...parseErrorInformation(error),
            error,
            taskId,
            function: 'tasks.unassignTask',
        });
        return null;
    }
};

export const claimTask = async (taskId: string): Promise<any> => {
    try {
        const url = `${baseAppUrl}/api/case/v1/tasks/${taskId}/assignments`;
        const { data } = await client.put<AxiosResponse>(url);

        browserLogInfo('Form entry time', {
            taskId,
            url,
            function: 'tasks.claimTask',
        });
        return data;
    } catch (error: any) {
        browserLogError('An error occurred during update task using v1', {
            ...parseErrorInformation(error),
            error,
            taskId,
            function: 'tasks.claimTask',
        });
        return null;
    }
};

export const getUnassignedTasks = async (): Promise<UnassignedTask[] | []> => {
    try {
        const { data } = await client.get(`${baseAppUrl}/api/case/v1/tasks/unassigned`);
        return data ?? [];
    } catch (error) {
        logError('getUnassignedTasks::', {
            ...parseErrorInformation(error),
            file: 'queries/v1/tasks/unassigned',
            function: 'getUnassignedTasks',
        });
        return [];
    }
};
