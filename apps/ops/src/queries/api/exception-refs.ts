import {
    ExceptionCountInput,
    ExceptionCountOutput,
    HTTPValidationError,
} from '@zinnia/api-types/types/analytics';
import { AxiosResponse } from 'axios';

import { NigoExceptionResponse } from '@deps/containers/nigo-entry-container/components/steps/nigo-details/nigo-details.types';
import {
    logError,
    LoggingContext,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';

import { baseAppUrl, se2ApiServerUrl } from '../api-config';
import { client } from '../api-utils/client';
import { serverApi } from '../api-utils/serverApiClient';

type searchNigoExceptionsQuery = {
    category: string[];
    carrier: string;
    process: string;
};

export type searchNigoExceptionsFilters = {
    categoryIds?: string[];
    carrier: string;
    process: string;
};

const nigoBaseUrl = se2ApiServerUrl + '/exceptionrefs';

export const searchNigoExceptions = async (
    filters: searchNigoExceptionsFilters,
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<NigoExceptionResponse[] | null> => {
    const url = `${nigoBaseUrl}/nigos/search`;
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/exception-refs',
        function: 'searchNigoExceptions',
        inputs: { filters },
        url,
        filters,
    };

    if (!accessToken) {
        logWarn(
            'exception-refs::No accessToken to fetch nigo exceptions',
            loggingContext
        );
        return null;
    }

    if (!filters?.carrier || !filters?.process) {
        logWarn(
            'exception-refs::No process or carrier specified to fetch nigo exceptions',
            loggingContext
        );
        return null;
    }

    try {
        const formData: searchNigoExceptionsQuery = {
            category: filters?.categoryIds ?? [],
            carrier: filters.carrier,
            process: filters.process,
        };

        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };
        const { data } = await serverApi.post<any>(
            url,
            formData,
            config,
            loggingContext
        );
        return data;
    } catch (error: any) {
        logError('exception-refs::searchNigoExceptions', {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        return null;
    }
};

export const getDashboardExceptionStats = async (
    query: ExceptionCountInput
): Promise<ExceptionCountOutput | HTTPValidationError> => {
    try {
        const { data: response } = await client.post<
            ExceptionCountInput,
            AxiosResponse<ExceptionCountOutput, HTTPValidationError>
        >(`${baseAppUrl}/api/dashboard/exception-count`, query);
        return {
            data: response.data,
            totalElements: response.totalElements,
            totalUniqueCases: response.totalUniqueCases,
        };
    } catch (error: any) {
        console.error(
            'getCaseDashboardStats::An error occurred while getting case dashboard stats results',
            error
        );
        if ('detail' in error) {
            return error.response;
        }
        return error;
    }
};
