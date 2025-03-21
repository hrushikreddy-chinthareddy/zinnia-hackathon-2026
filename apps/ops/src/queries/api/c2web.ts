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
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { logError, LoggingContext, logInfo, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl, contactCenterBaseUrlV2 } from '../api-config';
import { serverApi } from '../api-utils/serverApiClient';

const baseUrl = baseAppUrl + '/api/c2web/v2/';

export const getTransactionTypesSSR = async (
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<TransactionType[] | null> => {
    const loggingContext = { ...logCtx, file: 'queries/api/c2web', function: 'getTransactionTypes' };

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

        const { data } = await serverApi.get<any, AxiosResponse<TransactionType[]>>(url, config, loggingContext);
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
    } catch (e: any) {
        browserLogError('c2web::getTransactionSubTypes::error', { ...parseErrorInformation(e), transactionType });
        return null;
    }
};

export const getSearchTransactionsSSR = async (
    requestBody: SearchTransactionRequestBody,
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<SearchTransactionResponseBody | null> => {
    const loggingContext = { ...logCtx, file: 'queries/api/c2web', function: 'getSearchTransactionsSSR' };

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

export const searchForms = async (requestBody: SearchFormRequestBody, loggingContext?: object): Promise<FormDetails[] | null> => {
    try {
        browserLogInfo('contactCenterSearchForms', {
            ...loggingContext,
            payload: requestBody,
            url: `${baseUrl}/forms/search`,
            function: 'c2web.searchForms',
        });
        const { data } = await client.post<SearchFormRequestBody, AxiosResponse<FormDetails[]>>(`${baseUrl}/forms/search`, requestBody);
        return data;
    } catch (e) {
        browserLogError('contactCenterSearchForms', {
            ...loggingContext,
            ...parseErrorInformation(e),
            payload: requestBody,
            url: `${baseUrl}/forms/search`,
            function: 'c2web.searchForms',
        });

        return null;
    }
};

export const downloadFormById = async (formId: number): Promise<string | null> => {
    try {
        if (!formId) {
            throw new Error('No formId provided');
        }
        browserLogInfo('contactCenterDownloadFormById', {
            payload: formId,
            url: `${baseUrl}/forms/${formId}/download`,
            function: 'c2web.downloadFormById',
        });
        const { data } = await client.get<string, AxiosResponse<string>>(`${baseUrl}/forms/${formId}/download`);

        return data;
    } catch (e: any) {
        browserLogError('contactCenterDownloadFormById', {
            ...parseErrorInformation(e),
            payload: formId,
            url: `${baseUrl}/forms/${formId}/download`,
            error: e,
            function: 'c2web.downloadFormById',
        });
        throw new Error(e?.data?.message || 'Error');
    }
};

export const sendCommunication = async (requestBody: SendCommunicationRequestBody): Promise<Confirm | null> => {
    if (!requestBody?.correlationId) {
        throw new Error('No correlationId provided');
    }

    try {
        browserLogInfo('contactCenterSendCommunication', {
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
        browserLogError('contactCenterSendCommunication', {
            ...parseErrorInformation(error),
            payload: requestBody,
            url: `${baseUrl}/forms/communication`,
            function: 'c2web.contactCenterSendCommunication',
            error: error,
        });
        throw new Error(error?.data?.message || 'Error');
    }
};

export const getApplicableStatementsSSR = async (
    planCode: string,
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<StatementTypes[] | null> => {
    const loggingContext = { ...logCtx, file: 'queries/api/c2web', function: 'getActiveStatementsSSR', inputs: { planCode } };
    if (!accessToken) {
        logWarn('getApplicableStatementsSSR::No accessToken to fetch applicable statements', loggingContext);
        return null;
    }
    const url = `${contactCenterBaseUrlV2}/anniversary/statements/search`;
    logInfo('c2web: getApplicableStatementsSSR', { ...loggingContext, url });
    try {
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
        } = await serverApi.post<any, AxiosResponse<StatementTypesResponse>>(url, requestBody, config, loggingContext);
        return applicableStatement;
    } catch (error: any) {
        logError('c2web: getApplicableStatementsSSR', { ...parseErrorInformation(error), ...loggingContext, url });
        return null;
    }
};

export const getSearchTransactions = async (requestBody: SearchTransactionRequestBody): Promise<SearchTransactionResponseBody | null> => {
    try {
        const { data } = await client.post<SearchTransactionRequestBody, AxiosResponse<SearchTransactionResponseBody>>(
            `${baseUrl}/referencedata/transactions/search`,
            requestBody
        );
        browserLogInfo('getSearchTransactions::Fetched transactions', {
            payload: requestBody,
            url: `${baseUrl}/referencedata/transactions/search`,
            function: 'c2web.getSearchTransactions',
        });

        return data;
    } catch (error: any) {
        browserLogError('getSearchTransactions:: Failed to fetch transactions', {
            ...parseErrorInformation(error),
            payload: requestBody,
            url: `${baseUrl}/referencedata/transactions/search`,
            function: 'c2web.getSearchTransactions',
        });
        return null;
    }
};
