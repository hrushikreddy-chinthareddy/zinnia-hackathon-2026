import { NigoExceptionResponse } from '@deps/containers/nigo-entry-container/components/steps/nigo-details/nigo-details.types';
import {
    logError,
    LoggingContext,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';

import { se2ApiServerUrl } from '../api-config';
import { serverApi } from '../api-utils/serverApiClient';

export type searchNigoExceptionsFilters = {
    category: string[];
    businessProcess: string;
    carrier?: string;
};

const nigoBaseUrl = se2ApiServerUrl + '/exceptionrefs';

export const NigoSearch = async (
    filters: searchNigoExceptionsFilters,
    accessToken: string | undefined,
    logCtx: LoggingContext
): Promise<NigoExceptionResponse[] | null> => {
    const loggingContext = {
        ...logCtx,
        file: 'queries/api/exception-refs',
        function: 'searchNigoExceptions',
        inputs: { filters },
    };

    if (!accessToken) {
        logWarn(
            'exception-refs::No accessToken to fetch nigo exceptions',
            loggingContext
        );
        return null;
    }

    if (!filters?.businessProcess) {
        logWarn(
            'exception-refs::No process or carrier specified to fetch nigo exceptions',
            loggingContext
        );
        return null;
    }

    try {
        const formData: searchNigoExceptionsFilters = {
            category: filters?.category ?? [],
            businessProcess: filters?.businessProcess,
            carrier: filters.carrier,
        };

        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        const { data } = await serverApi.post<any>(
            `${nigoBaseUrl}/nigos/search`,
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
