import { AxiosResponse } from 'axios';

import { SendCommunicationRequestBody } from '@deps/models/case/correspondence';
import { Confirm, FormDetails, SearchFormRequestBody, TransactionSubType, TransactionType } from '@deps/models/case/send-document';
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

export const searchForms = async (requestBody: SearchFormRequestBody): Promise<FormDetails[] | null> => {
    try {
        const { data } = await client.post<SearchFormRequestBody, AxiosResponse<FormDetails[]>>(`${baseUrl}/forms/search`, requestBody);
        return data;
    } catch (e) {
        console.error('c2web::getCallCenterForms::error', e);
        return null;
    }
};

export const downloadFormById = async (formId: number): Promise<string | null> => {
    try {
        if (!formId) {
            throw new Error('No formId provided');
        }
        const { data } = await client.get<string, AxiosResponse<string>>(`${baseUrl}/forms/${formId}/download`);

        return data;
    } catch (e: any) {
        console.error('c2web::downloadCallCenterForms::error', e);
        throw new Error(e?.data?.message || 'Error');
    }
};

export const sendCommunication = async (requestBody: SendCommunicationRequestBody): Promise<Confirm | null> => {
    if (!requestBody?.correlationId) {
        throw new Error('No correlationId provided');
    }

    try {
        const { data } = await client.post<SendCommunicationRequestBody, AxiosResponse<Confirm>>(
            `${baseUrl}/forms/communication`,
            requestBody
        );

        return data;
    } catch (error: any) {
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
