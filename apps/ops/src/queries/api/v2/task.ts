import { datadogLogs } from '@datadog/browser-logs';
import { AxiosResponse } from 'axios';

import { Reg60FormData } from '@deps/containers/otp/reg60-forms/reg60.types';
import { CreateTaskBody, TaskV2Payload } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { ActiveWithdrawalCaseData } from '@deps/models/case/withdrawal/case';
import { baseAppUrl, se2ApiServerUrl, se2ApiServerUrlV2 } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { CaseSearchErrorResponse, CaseTaskSearchResponse } from '@deps/types/search';
import { pullFromCache, writeToCache } from '@deps/utils/cache';
import { logError, logInfo, parseErrorInformation } from '@deps/utils/server-logging';

const baseCasesV2Url = `${baseAppUrl}/api/case/v2/cases`;
const tasksV2Url = `${baseAppUrl}/api/case/v2/tasks`;
const ssrCasesUrlV2 = `${se2ApiServerUrlV2}`;

export const getCaseTaskByIdSSR = async (taskId: string, accessToken: string | undefined): Promise<ManagementTask<TaskStatus> | null> => {
    try {
        const { data } = await serverApi.get<any>(`${ssrCasesUrlV2}/tasks/${taskId}`, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        });

        return data;
    } catch (error: any) {
        logError('getCaseTaskById', { ...parseErrorInformation(error), taskId, file: 'queries/api/v2/task', function: 'getCaseTaskById' });
        return null;
    }
};

export const getTaskInstance = async (query: any): Promise<ManagementTask | null> => {
    try {
        const cachedResult = pullFromCache('getTaskInstance', query);

        if (cachedResult) {
            return cachedResult;
        }

        const { data } = await client.get<any, AxiosResponse>(`${tasksV2Url}/${query.taskId}`, query);

        writeToCache('getTaskInstance', query, data);

        return data;
    } catch (error: any) {
        logError('getTaskInstance::An error occurred while getting Task Instance', { ...parseErrorInformation(error), query, file: 'queries/api/v2/task', function: 'getTaskInstance' });
        return null;
    }
};

export const createTaskSSR = async <T>(
    caseId: string,
    accessToken: string | undefined,
    payload: CreateTaskBody<TaskStatus, T>
): Promise<ManagementTask<TaskStatus>> => {
    try {
        const { data } = await serverApi.post<CreateTaskBody<TaskStatus, T>, AxiosResponse>(
            `${se2ApiServerUrlV2}/cases/${caseId}/tasks`,
            payload,
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
        return data;
    } catch (error: any) {
        logError('createTaskSSR', { ...parseErrorInformation(error), caseId, file: 'queries/api/v2/task', function: 'createTaskSSR' });
        return error.response;
    }
};

export const searchTaskSSR = async (
    caseId: string,
    accessToken: string | undefined
): Promise<CaseTaskSearchResponse | CaseSearchErrorResponse> => {
    try {
        const { data } = await serverApi.post<{ caseId: string }, AxiosResponse>(
            `${se2ApiServerUrl}/tasks/search`,
            { caseId },
            {
                authorization: `Bearer ${accessToken}`,
                headers: {
                    Accept: '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    Connection: 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
        return data;
    } catch (error: any) {
        logError('searchTaskSSR', { ...parseErrorInformation(error), caseId, file: 'queries/api/v2/task', function: 'searchTaskSSR' });
        return error.response;
    }
};

export const createTask = async (
    caseId: string,
    payload: CreateTaskBody<TaskStatus, Reg60FormData | ActiveWithdrawalCaseData>,
    entryDuration?: number
): Promise<any> => {
    try {
        const logTime = entryDuration ? performance.now() - entryDuration : 0;
        const timeInSeconds = ((logTime % 60000) / 1000).toFixed(0);
        const url = `${baseCasesV2Url}/${caseId}/tasks`;
        const { data } = await client.post<CreateTaskBody<TaskStatus, Reg60FormData | ActiveWithdrawalCaseData>, AxiosResponse>(
            url,
            payload
        );
        logInfo('Successfully created task using v2', { caseId, url, function: 'tasks.createTask' });

        datadogLogs.logger.info('Form entry time', {
            timeElapsedSinceLoad: timeInSeconds,
            documentType: payload.taskType,
            contractId: payload.data.contractNum,
            documentNumber: payload.data.documentNumber,
            caseId,
            carrier: payload.carrier,
            url,
            taskStatus: payload.status,
            function: 'tasks.createTask',
        });

        return data;
    } catch (error: any) {
        logError('An error occurred during create task using v2', { error, caseId, function: 'tasks.createTask' });
        return null;
    }
};

export const updateTask = async (
    caseId: string,
    taskId: string,
    payload: CreateTaskBody<TaskStatus, TaskV2Payload>,
    entryDuration?: number
): Promise<any> => {
    try {
        const logTime = entryDuration ? performance.now() - entryDuration : 0;
        const timeInSeconds = ((logTime % 60000) / 1000).toFixed(0);
        const url = `${baseCasesV2Url}/${caseId}/tasks/${taskId}`;
        const { data } = await client.put<CreateTaskBody<TaskStatus, TaskV2Payload>, AxiosResponse>(url, payload);
        logInfo('Successfully updated task using v2', { caseId, taskId, url, function: 'tasks.updateTask' });

        datadogLogs.logger.info('Form entry time', {
            timeElapsedSinceLoad: timeInSeconds,
            documentType: payload.taskType,
            contractId: payload.data.contractNum,
            documentNumber: payload.data.documentNumber,
            caseId,
            carrier: payload.carrier,
            url,
            taskStatus: payload.status,
            function: 'tasks.updateTask',
        });

        return data;
    } catch (error: any) {
        logError('An error occurred during update task using v2', { error, caseId, taskId, function: 'tasks.updateTask' });
        return null;
    }
};
