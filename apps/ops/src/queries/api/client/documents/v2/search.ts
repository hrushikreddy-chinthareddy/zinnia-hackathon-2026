import { AxiosResponse } from 'axios';

import { PolicyDocumentApiRequest, DocumentErrorResponse } from '@deps/models/case/document';
import { DocumentApiRequestInputs, documentBaseUrl } from '@deps/queries/api/documents';
import { client } from '@deps/queries/api-utils/client';
import { pullFromCache, writeToCache } from '@deps/utils/cache';

export const getDocumentsV2 = async ({
    periods,
    limit,
    offset,
    ...queryParams
}: DocumentApiRequestInputs): Promise<PolicyDocumentApiRequest | DocumentErrorResponse> => {
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
        const cachedResult = pullFromCache('getDocuments', queryString.toString());

        if (cachedResult) return cachedResult;

        const data = await client.get<any, AxiosResponse>(`${documentBaseUrl}?${queryString.toString()}`);

        writeToCache('getDocuments', queryString.toString(), data);

        return data;
    } catch (error: any) {
        console.error('An error occurred while getting document results', error);
        return error.response || error;
    }
};
