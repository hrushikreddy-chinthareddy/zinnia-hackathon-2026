import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import {
    DocumentClassification,
    DocumentDownloadV3WithMime,
} from '@deps/types/documents-v3';
import { browserLogWarn } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

// note: docType and clientCode are used to allow v3 to hit v2 documents for us.  We can remove if all v2 documents are migrated

export const downloadDocumentV3 = async (
    documentId: string,
    documentClassification: DocumentClassification,
    parentCarrierCode: string
): Promise<DocumentDownloadV3WithMime | null> => {
    try {
        const url = `${baseAppUrl}/api/document/v3/documents/${documentId}/download?parentCarrierCode=${parentCarrierCode.toUpperCase()}&documentClassification=${documentClassification}`;
        const { data } = await client.get<
            DocumentDownloadV3WithMime,
            AxiosResponse
        >(url);
        return data;
    } catch (error: any) {
        browserLogWarn('An error occurred while downloading document', {
            ...parseErrorInformation(error),
            file: 'queries/api/documents',
            function: 'downloadDocumentV3',
        });

        return error.response;
    }
};
