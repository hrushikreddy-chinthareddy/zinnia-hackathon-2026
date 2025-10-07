import { AxiosResponse } from 'axios';

import {
    PolicyDocumentApiRequest,
    DocumentErrorResponse,
} from '@deps/models/case/document';
import {
    DocumentApiRequestInputs,
    documentBaseUrl,
} from '@deps/queries/api/documents';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { pullFromCache, writeToCache } from '@deps/utils/cache';
import { parseErrorInformation } from '@deps/utils/server-logging';

export const getDocumentsV2 = async ({
    periods,
    limit,
    offset,
    ...queryParams
}: DocumentApiRequestInputs): Promise<
    PolicyDocumentApiRequest | DocumentErrorResponse
> => {
    try {
        const queryString = new URLSearchParams(queryParams);
        if (periods) {
            queryString.append('periods', JSON.stringify(periods));
        }
        if (limit) {
            queryString.append('limit', `${limit}`);
        }
        if (offset) {
            queryString.append('offset', `${offset}`);
        }
        const cachedResult = pullFromCache(
            'getDocuments',
            queryString.toString()
        );

        browserLogInfo('getDocumentsV2::Fetching documents', {
            queryParams,
            periods,
            limit,
            offset,
        });

        if (cachedResult) return cachedResult;

        const data = await client.get<any, AxiosResponse>(
            `${documentBaseUrl}?${queryString.toString()}`
        );

        writeToCache('getDocuments', queryString.toString(), data);

        return data;
    } catch (error: any) {
        browserLogError(
            'getDocumentsV2:: Error occurred while getting document results',
            {
                ...parseErrorInformation(error),
                queryParams,
                periods,
                limit,
                offset,
            }
        );
        return error.response || error;
    }
};
