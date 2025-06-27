import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import {
    DocumentMetadata,
    DocumentMetaDataRequest,
} from '@deps/types/documents-v3';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export const getDocumentMetadataV3 = async (
    requestBody: DocumentMetaDataRequest,
    limit: number,
    offset: number
): Promise<ApiResponse<DocumentMetadata[]>> => {
    try {
        browserLogInfo('getting document v3 metadata', {
            payload: requestBody,
            file: 'queries/api/documents/v3/metadata',
            function: 'getDocumentMetadataV3',
        });

        const url = `${baseAppUrl}/api/document/v3/documentType/search?limit=${limit}&offset=${offset}`;
        const response = await client.post<
            DocumentMetaDataRequest,
            AxiosResponse
        >(url, requestBody);

        if (response.status === StatusCode.Okay) {
            return { data: response.data?.documentTypeList || [], error: null };
        } else {
            const error = new Error(
                response?.data?.message || response?.statusText
            );
            return {
                data: null,
                error: { ...error, status: response?.status || 500 },
            };
        }
    } catch (error: any) {
        browserLogError(
            'An error occurred while getting document v3 metadata',
            {
                ...parseErrorInformation(error),
                file: 'queries/api/documents/v3/metadata',
                function: 'getDocumentMetadataV3',
            }
        );

        return error.response;
    }
};
