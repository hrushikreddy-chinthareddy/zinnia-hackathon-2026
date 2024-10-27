import { AxiosResponse } from 'axios';

import { ActiveReg60Case } from '@deps/containers/otp/reg60-forms/reg60.types';
import { ProcessType } from '@deps/models/case/enums';
import { CreateTaskBody, CreateTaskResponse, FormMetadata, TaskType, TaskV1Payload } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { ActiveWithdrawalCase, DigitalFormWithdrawal } from '@deps/models/case/withdrawal/case';
import { baseAppUrl, se2ApiServerUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logError, logInfo, parseErrorInformation } from '@deps/utils/server-logging';

const baseCasesUrl = `${baseAppUrl}/api/case/v1/cases`;
const baseTasksUrl = `${baseAppUrl}/api/case/v1/tasks`;
const ssrCasesUrl = `${se2ApiServerUrl}/cases`;

export const getCaseTasksSSR = async (
    caseId: string,
    accessToken: string,
    queryParams: { [key: string]: string } = {}
): Promise<ActiveWithdrawalCase[]> => {
    try {
        const url = new URL(`${ssrCasesUrl}/${caseId}/tasks`);
        url.search = new URLSearchParams(queryParams).toString();
        logInfo('getCaseTasksSSR', { caseId, file: 'queries/api/v1/task', function: 'getCaseTasksSSR', url });

        const { data } = await serverApi.get<{ data: ActiveWithdrawalCase[] }>(url.href, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        });

        return data.data;
    } catch (error: any) {
        logError('getCaseTasksSSR', { ...parseErrorInformation(error), caseId, file: 'queries/api/cases', function: 'getCaseTasksSSR' });
        return [];
    }
};

export const postCaseTasksSSR = async (
    caseId: string,
    formData: DigitalFormWithdrawal,
    accessToken: string
): Promise<ActiveWithdrawalCase | null> => {
    try {
        const url = `${ssrCasesUrl}/${caseId}/tasks`;
        logInfo('postCaseTasksSSR', { caseId, file: 'queries/api/v1/task', function: 'postCaseTasksSSR', url });
        const { data } = await serverApi.post<DigitalFormWithdrawal>(url, formData, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        });

        return data as ActiveWithdrawalCase;
    } catch (error: any) {
        logError('postCaseTasksSSR', { ...parseErrorInformation(error), caseId, file: 'queries/api/cases', function: 'postCaseTasksSSR' });
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
        logInfo('Saving a case task SSR', {
            file: 'queries/api/v1/task',
            function: 'putCaseTask',
            url: `${baseCasesUrl}/${caseId}/tasks/${taskId}`,
        });
        return data;
    } catch (error: any) {
        logError('An error occurred while saving a case task', {
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
        logInfo('getCaseTasks', {
            caseId: query.caseId,
            file: 'queries/api/v1/task',
            function: 'getCaseTasks',
            url: `${baseAppUrl}/cases/${query.caseId}/tasks`,
        });
        const { data } = await client.get<any, AxiosResponse>(`${baseCasesUrl}/${query.caseId}/tasks`, query);
        return data?.data;
    } catch (error: any) {
        logError('getCaseTasks', { error });
        return error.response;
    }
};

export const getCaseTasksByIdSSR = async (caseId: string, taskId: string, accessToken: string): Promise<ActiveWithdrawalCase | null> => {
    try {
        const url = new URL(`${ssrCasesUrl}/${caseId}/tasks/${taskId}`);
        logInfo('getCaseTasksByIdSSR', { caseId, taskId, file: 'queries/api/v1/task', function: 'getCaseTasksByIdSSR', url });

        const { data } = await serverApi.get<ActiveWithdrawalCase>(url.href, {
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
        logError('getCaseTasksByIdSSR', {
            ...parseErrorInformation(error),
            caseId,
            taskId,
            file: 'queries/api/cases',
            function: 'getCaseTasksByIdSSR',
        });
        return null;
    }
};

export const getAssignedTasks = async () => {
    try {
        const { data } = await client.get(`${baseAppUrl}/api/case/v1/tasks/assigned`);
        return data ?? [];
    } catch (error) {
        logError('getAssignedTasks::', {
            ...parseErrorInformation(error),
            file: 'queries/v1/tasks/assigned',
            function: 'getAssignedTasks',
        });
        return [];
    }
};

export const getTaskFormMetadataSSR = async (
    clientId: string,
    taskType?: TaskType,
    processType?: ProcessType,
    accessToken?: string
): Promise<FormMetadata | null> => {
    try {
        const url = `${ssrCasesUrl}/v1/form/metadata?process=${processType}&taskType=${taskType}`;
        logInfo('getTaskFormMetadataSSR', {
            file: 'queries/api/newBusiness/v1/suitability',
            function: 'getTaskFormMetadataSSR',
            url,
        });
        const { data } = await serverApi.get<null, AxiosResponse>(url, {
            authorization: `Bearer ${accessToken}`,
            headers: {
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Access-Control-Allow-Origin': '*',
            },
        });

        return data as FormMetadata;
    } catch (error: any) {
        logError('getFormSchemaSSR', {
            ...parseErrorInformation(error),

            file: 'queries/api/newBusiness/v1/suitability',
            function: 'getTaskFormMetadataSSR',
        });
        return null;
    }
};
