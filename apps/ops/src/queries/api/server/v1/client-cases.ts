import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import {
    IllustraionsClientCaseSearchResponse,
    IllustrationsClientCase,
} from '@deps/types/illustrations';
import { LoggingContext } from '@deps/utils/server-logging';

export const CLIENT_CASE_MANAGER_API_ORIGIN = 'client-case-manager-api';
export const searchClientCaseByEappId = async (
    eAppId: string,
    token: string,
    loggingContext: LoggingContext
) => {
    try {
        const config = {
            authorization: `Bearer ${token}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        const searchUrl = `${apiServerBaseUrl}/client-case-manager/v1/client-case/search?eAppId=${eAppId}`;
        const { data: searchResponse } = await serverApi.get<
            any,
            AxiosResponse<IllustraionsClientCaseSearchResponse>
        >(searchUrl, config, loggingContext);

        return searchResponse.results || [];
    } catch (error: any) {
        throwTypedError(error.message, CLIENT_CASE_MANAGER_API_ORIGIN);
    }
};

export const createClientCase = async (
    clientCaseData: Partial<IllustrationsClientCase>,
    token: string,
    loggingContext: LoggingContext
) => {
    try {
        const { data } = await serverApi.post(
            `${apiServerBaseUrl}/client-case-manager/v1/client-case`,
            clientCaseData,
            {
                authorization: `Bearer ${token}`,
                headers: {
                    'Content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return data;
    } catch (error: any) {
        throwTypedError(error.message, CLIENT_CASE_MANAGER_API_ORIGIN);
    }
};

export const patchClientCase = async (
    clientCaseData: Partial<IllustrationsClientCase> & { id: string },
    token: string,
    loggingContext: LoggingContext
) => {
    try {
        const { data } = await serverApi.realPatch(
            `${apiServerBaseUrl}/client-case-manager/v1/client-case/${clientCaseData.id}`,
            clientCaseData,
            {
                authorization: `Bearer ${token}`,
                headers: {
                    'Content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            },
            loggingContext
        );

        return data;
    } catch (error: any) {
        throwTypedError(error.message, CLIENT_CASE_MANAGER_API_ORIGIN);
    }
};
