import { AxiosResponse } from 'axios';

import { Reg60FormData } from '@deps/containers/otp/reg60-forms/reg60.types';
import {
    CreateTaskBody,
    RenewalsFormData,
    TaskV2Payload,
} from '@deps/models/case/task';
import {
    ManagementTask,
    TaskLabel,
    TaskStatus,
} from '@deps/models/case/task-instance';
import { ActiveWithdrawalCaseData } from '@deps/models/case/withdrawal/case';
import {
    baseAppUrl,
    se2ApiServerUrl,
    se2ApiServerUrlV2,
} from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    CaseSearchErrorResponse,
    CaseTaskSearchResponse,
} from '@deps/types/search';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import {
    logError,
    LoggingContext,
    logInfo,
    parseErrorInformation,
} from '@deps/utils/server-logging';

const baseCasesV2Url = `${baseAppUrl}/api/case/v2/cases`;
const tasksV2Url = `${baseAppUrl}/api/case/v2/tasks`;
const ssrCasesUrlV2 = `${se2ApiServerUrlV2}`;

export const getCaseTaskByIdSSR = async (
    taskId: string,
    accessToken: string | undefined,
    loggingContext: LoggingContext
): Promise<ManagementTask<TaskStatus> | null> => {
    const url = `${ssrCasesUrlV2}/tasks/${taskId}`;
    const logCtx = {
        ...loggingContext,
        file: 'queries/api/v2/task',
        function: 'getCaseTaskByIdSSR',
        inputs: { taskId },
        url,
    };
    try {
        const { data } = await serverApi.get<any>(
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
            logCtx
        );
        logInfo('getCaseTaskByIdSSR::Successfully retrived task by id', {
            caseId: data?.caseId,
            taskType: data?.taskType,
            process: data?.process,
            carrier: data?.carrier,
            ...logCtx,
        });
        return data;
    } catch (error: any) {
        logError('getCaseTaskByIdSSR::Failed to retrieve task by id', {
            ...parseErrorInformation(error),
            ...logCtx,
        });
        return null;
    }
};

export const getTaskInstance = async (
    query: any
): Promise<ManagementTask | null> => {
    try {
        // removing the cache logic for fetching task instance as we try to upload a new document to the task and then open the task sidesheet, we want the newly uploaded document to be shown in the task sidesheet without refreshing the page
        const { data } = await client.get<any, AxiosResponse>(
            `${tasksV2Url}/${query.taskId}`,
            query
        );

        return data;
    } catch (error: any) {
        browserLogError(
            'getTaskInstance::An error occurred while getting Task Instance',
            {
                ...parseErrorInformation(error),
                query,
                file: 'queries/api/v2/task',
                function: 'getTaskInstance',
            }
        );
        return null;
    }
};

export const createTaskSSR = async <T>(
    caseId: string,
    accessToken: string | undefined,
    payload: CreateTaskBody<TaskStatus, T>,
    logCtx: LoggingContext
): Promise<ManagementTask<TaskStatus>> => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/v2/task',
        function: 'createTaskSSR',
        inputs: { caseId, payload },
    };
    try {
        const { data } = await serverApi.post<
            CreateTaskBody<TaskStatus, T>,
            AxiosResponse
        >(
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
            },
            loggingContext
        );
        return data;
    } catch (error: any) {
        logError('createTaskSSR', {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        return error.response;
    }
};

export const searchTaskSSR = async (
    caseId: string,
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<CaseTaskSearchResponse | CaseSearchErrorResponse> => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/v2/task',
        function: 'searchTaskSSR',
        inputs: { caseId },
    };
    try {
        const url = `${se2ApiServerUrl}/tasks/search`;
        logInfo('searchTaskSSR::Fetching case tasks', {
            ...loggingContext,
            url,
        });
        const { data } = await serverApi.post<
            { caseId: string },
            AxiosResponse
        >(
            url,
            { caseId },
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
        logInfo('searchTaskSSR::Performed case tasks search', {
            ...loggingContext,
            url,
        });
        return data;
    } catch (error: any) {
        logError('searchTaskSSR::Failed to perform case tasks search', {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        return error.response;
    }
};

export const createTask = async (
    caseId: string,
    payload: CreateTaskBody<
        TaskStatus,
        Reg60FormData | ActiveWithdrawalCaseData | RenewalsFormData
    >,
    entryDuration?: number
): Promise<any> => {
    try {
        const logTime = entryDuration ? performance.now() - entryDuration : 0;
        const timeInSeconds = ((logTime % 60000) / 1000).toFixed(0);
        const url = `${baseCasesV2Url}/${caseId}/tasks`;
        const { data } = await client.post<
            CreateTaskBody<
                TaskStatus,
                Reg60FormData | ActiveWithdrawalCaseData | RenewalsFormData
            >,
            AxiosResponse
        >(url, payload);

        browserLogInfo(
            'v2/task:createTask:: Successfully created task using v2',
            {
                timeElapsedSinceLoad: timeInSeconds,
                documentType: payload?.taskType,
                contractId: payload?.data?.contractNum,
                documentNumber: payload?.data?.documentNumber,
                caseId,
                carrier: payload?.carrier,
                url,
                taskStatus: payload?.status,
                function: 'tasks.createTask',
            }
        );

        return data;
    } catch (error: any) {
        browserLogError(
            'v2/task:createTask::An error occurred during create task using v2',
            {
                ...parseErrorInformation(error),
                caseId,
                function: 'tasks.createTask',
            }
        );
        return null;
    }
};

export const updateTask = async (
    caseId: string,
    taskId: string,
    payload: CreateTaskBody<TaskStatus, TaskV2Payload>,
    entryDuration?: number
): Promise<any> => {
    const status = payload?.status;
    const statusLabel =
        status == TaskStatus.InProgress
            ? TaskLabel.InProgress
            : status == TaskStatus.Pending
            ? TaskLabel.Pending
            : TaskLabel.Completed;

    try {
        const logTime = entryDuration ? performance.now() - entryDuration : 0;
        const timeInSeconds = ((logTime % 60000) / 1000).toFixed(0);
        const url = `${baseCasesV2Url}/${caseId}/tasks/${taskId}`;
        const { data } = await client.put<
            CreateTaskBody<TaskStatus, TaskV2Payload>,
            AxiosResponse
        >(url, payload);

        browserLogInfo(
            `v2/task:updateTask::Successfully updated task to ${statusLabel} `,
            {
                documentType: payload?.taskType,
                contractId: payload?.data?.contractNum,
                documentNumber: payload?.data?.documentNumber,
                caseId,
                carrier: payload?.carrier,
                url,
                taskStatus: payload?.status,
                function: 'tasks.updateTask',
            }
        );

        return data;
    } catch (error: any) {
        browserLogError(
            `v2/task:updateTask::An error occurred while updating task using v2 to ${statusLabel}`,
            {
                ...parseErrorInformation(error),
                caseId,
                taskId,
                function: 'tasks.updateTask',
            }
        );
        return null;
    }
};
