import { NigoExceptionResponse } from '@deps/containers/nigo-entry-container/components/steps/nigo-details/nigo-details.types';
import { logError, LoggingContext, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { se2ApiServerUrl } from '../api-config';
import { serverApi } from '../api-utils/serverApiClient';

type searchNigoExceptionsQuery = {
    category: string[];
    carrier: string;
    process: string;
};

export type searchNigoExceptionsFilters = {
    categoryIds: string[];
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
        logWarn('exception-refs::No accessToken to fetch nigo exceptions', loggingContext);
        return null;
    }

    if (!filters?.carrier || !filters?.process) {
        logWarn('exception-refs::No process or carrier specified to fetch nigo exceptions', loggingContext);
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

        const { data } = await serverApi.post<any>(url, formData, config, loggingContext);
        return data;
    } catch (error: any) {
        logError('exception-refs::searchNigoExceptions', { ...parseErrorInformation(error), ...loggingContext });
        return null;
    }
};
