import { datadogLogs } from '@datadog/browser-logs';
import { AxiosResponse } from 'axios';

import { SendCommunicationRequestBody } from '@deps/models/case/correspondence';
import {
    Confirm,
    FormDetails,
    SearchFormRequestBody,
    SearchTransactionResponseBody,
    SearchTransactionRequestBody,
    TransactionSubType,
    TransactionType,
} from '@deps/models/case/send-document';
import { StatementTypes, StatementTypesResponse } from '@deps/models/case/send-statement';
import { client } from '@deps/queries/api-utils/client';
import { logError, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl, contactCenterBaseUrlV2 } from '../api-config';
import { serverApi } from '../api-utils/serverApiClient';

const baseUrl = baseAppUrl + '/api/c2web/v2/';

export const getTransactionTypesSSR = async (accessToken: string | undefined, userInfo: object = {}): Promise<TransactionType[] | null> => {
    const loggingContext = { file: 'queries/api/c2web', function: 'getTransactionTypes', ...userInfo };

    if (!accessToken) {
        logWarn('getPolicyDetailsSSR::No accessToken to fetch transaction types', loggingContext);
        return null;
    }

    try {
        const url = `${contactCenterBaseUrlV2}/referencedata/TRANSACTION_TYPE`;

        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        const { data } = await serverApi.get<any, AxiosResponse<TransactionType[]>>(url, config);
        return data;
    } catch (error: any) {
        logError('c2web: getTransactionTypes', { ...parseErrorInformation(error), ...loggingContext });
        return null;
    }
};

export const getTransactionSubTypes = async (transactionType: string): Promise<TransactionSubType[] | null> => {
    try {
        const { data } = await client.get<any, AxiosResponse<TransactionSubType[]>>(
            `${baseUrl}/referencedata/TRANSACTION_TYPE/${transactionType}/subreferencedata/TRANSACTION_SUB_TYPE`
        );

        return data;
    } catch (e) {
        console.error('c2web::getTransactionSubTypes::error', e);
        return null;
    }
};

export const getSearchTransactionsSSR = async (
    requestBody: SearchTransactionRequestBody,
    accessToken: string | undefined,
    userInfo: object = {}
): Promise<SearchTransactionResponseBody | null> => {
    const loggingContext = { file: 'queries/api/c2web', function: 'getSearchTransactionsSSR', ...userInfo };

    if (!accessToken) {
        logWarn('getSearchTransactionsSSR::No accessToken to fetch transaction types', loggingContext);
        return null;
    }

    try {
        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        const { data } = await client.post<SearchTransactionRequestBody, AxiosResponse<SearchTransactionResponseBody>>(
            `${contactCenterBaseUrlV2}/referencedata/transactions/search`,
            requestBody,
            config
        );
        return data;
    } catch (error: any) {
        logError('c2web: getSearchTransactionsSSR', { ...parseErrorInformation(error), ...loggingContext });
        return null;
    }
};

export const searchForms = async (requestBody: SearchFormRequestBody): Promise<FormDetails[] | null> => {
    try {
        datadogLogs.logger.info('contactCenterSearchForms', {
            payload: requestBody,
            url: `${baseUrl}/forms/search`,
            function: 'c2web.searchForms',
        });
        const { data } = await client.post<SearchFormRequestBody, AxiosResponse<FormDetails[]>>(`${baseUrl}/forms/search`, requestBody);
        return data;
    } catch (e) {
        datadogLogs.logger.error('contactCenterSearchForms', {
            payload: requestBody,
            url: `${baseUrl}/forms/search`,
            error: e,
            function: 'c2web.searchForms',
        });
        console.error('c2web::contactCenterSearchForms::error', e);
        return null;
    }
};

export const downloadFormById = async (formId: number): Promise<string | null> => {
    try {
        if (!formId) {
            throw new Error('No formId provided');
        }
        datadogLogs.logger.info('contactCenterDownloadFormById', {
            payload: formId,
            url: `${baseUrl}/forms/${formId}/download`,
            function: 'c2web.downloadFormById',
        });
        const { data } = await client.get<string, AxiosResponse<string>>(`${baseUrl}/forms/${formId}/download`);

        return data;
    } catch (e: any) {
        datadogLogs.logger.error('contactCenterDownloadFormById', {
            payload: formId,
            url: `${baseUrl}/forms/${formId}/download`,
            error: e,
            function: 'c2web.downloadFormById',
        });
        console.error('c2web::contactCenterDownloadFormById::error', e);
        throw new Error(e?.data?.message || 'Error');
    }
};

export const sendCommunication = async (requestBody: SendCommunicationRequestBody): Promise<Confirm | null> => {
    if (!requestBody?.correlationId) {
        throw new Error('No correlationId provided');
    }

    try {
        datadogLogs.logger.info('contactCenterSendCommunication', {
            payload: requestBody,
            url: `${baseUrl}/forms/communication`,
            function: 'c2web.contactCenterSendCommunication',
        });
        const { data } = await client.post<SendCommunicationRequestBody, AxiosResponse<Confirm>>(
            `${baseUrl}/forms/communication`,
            requestBody
        );

        return data;
    } catch (error: any) {
        datadogLogs.logger.error('contactCenterSendCommunication', {
            payload: requestBody,
            url: `${baseUrl}/forms/communication`,
            function: 'c2web.contactCenterSendCommunication',
            error: error,
        });
        console.error('c2web::sendDocumentCallCenterForms::error', error);
        throw new Error(error?.data?.message || 'Error');
    }
};

export const getApplicableStatementsSSR = async (
    planCode: string,
    accessToken: string | undefined,
    userInfo: object = {}
): Promise<StatementTypes[] | null> => {
    const loggingContext = { file: 'queries/api/c2web', function: 'getActiveStatementsSSR', ...userInfo };

    if (!accessToken) {
        logWarn('getApplicableStatementsSSR::No accessToken to fetch applicable statements', loggingContext);
        return null;
    }

    try {
        const url = `${contactCenterBaseUrlV2}/anniversary/statements/search`;
        const requestBody = {
            planCode,
        };
        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        const {
            data: { applicableStatement },
        } = await serverApi.post<any, AxiosResponse<StatementTypesResponse>>(url, requestBody, config);
        return applicableStatement;
    } catch (error: any) {
        logError('c2web: getApplicableStatementsSSR', { ...parseErrorInformation(error), ...loggingContext });
        return null;
    }
};
