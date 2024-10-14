import { NigoExceptionResponse } from '@deps/containers/nigo-entry-container/components/steps/nigo-details/nigo-details.types';
import { logError, logWarn, parseErrorInformation } from '@deps/utils/server-logging';

import { se2ApiServerUrl } from '../api-config';
import { serverApi } from '../api-utils/serverApiClient';

type searchNigoExceptionsQuery = {
    category: string[];
};

const nigoBaseUrl = se2ApiServerUrl + '/exceptionrefs';

export const searchNigoExceptions = async (categoryIds: string[], accessToken: string | undefined ): Promise<NigoExceptionResponse[] | null> => {
    const loggingContext = { file: 'queries/api/exception-refs', function: 'searchNigoExceptions',  };

    if (!accessToken) {
        logWarn('exception-refs::No accessToken to fetch nigo exceptions', loggingContext);
        return null;
    }

    try {
        const formData: searchNigoExceptionsQuery = {
            category: categoryIds ?? []
        };
        const config = {
            authorization: `Bearer ${accessToken}`,
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };

        const { data } = await serverApi.post<any>(`${nigoBaseUrl}/nigos/search`, formData, config);
        return data;
    } catch (error: any) {
        logError('exception-refs::searchNigoExceptions', { ...parseErrorInformation(error), ...loggingContext });
        return null;
    }
};
