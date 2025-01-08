import { DocumentDownloadResponse } from '@zinnia/api-types/types/documents-v3';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';

// Download a document using the documents v3 api.  The v3 api provides backwards compatibility using query params that map to a v2 endpoint
export const downloadDocument = async ({
    documentId,
    source,
    clientCode,
    authToken,
}: {
    documentId: string;
    source?: string;
    clientCode?: string;
    authToken?: string;
}): Promise<ApiResponse<DocumentDownloadResponse>> => {
    // BPB - TODO - Feature Flag decision making
    try {
        let url = `${apiServerBaseUrl}/document/v3/documents/${documentId}/download`;
        if (clientCode || source) {
            url += `?clientCode=${clientCode}&source=${source}`;
        }
        const request = client.get<DocumentDownloadResponse>(url, {
            authorization: `Bearer ${authToken}`,
        });

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
                ...(e instanceof Error
                    ? e
                    : new Error((e as Error)?.message || 'an error occurred while attempting to download the document')),
                status: 500,
            },
        };
    }
};
