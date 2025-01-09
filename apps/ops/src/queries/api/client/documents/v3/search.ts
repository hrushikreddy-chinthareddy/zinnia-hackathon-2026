import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import { SearchDocumentResponse } from '@deps/types/documents-v3';

// Search for documents using the documents v3 api
// BPB - toDo: next route handler
export const searchDocuments = async ({
    limit = 10,
    offset = 0,
    searchBody,
}: {
    limit?: number;
    offset?: number;
    searchBody: SearchRequest;
}): Promise<ApiResponse<SearchDocumentResponse>> => {
    try {
        const request = client.post<SearchRequest, AxiosResponse<SearchDocumentResponse>>(
            `${baseAppUrl}/api/document/v3/documents/search?limit=${limit}&offset=${offset}`,
            searchBody
        );

        const response = await request;
        if (response.status === StatusCode.Okay) {
            return { data: response.data, error: null };
        } else {
            const error = new Error(response?.data?.message || response?.statusText);
            return { data: null, error: { ...error, status: response?.status || 500 } };
        }
    } catch (e) {
        return {
            data: null,
            error: {
                ...(e instanceof Error ? e : new Error((e as Error)?.message || 'an error occurred while searching for documents')),
                status: 500,
            },
        };
    }
};
