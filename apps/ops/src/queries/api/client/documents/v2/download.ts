import { AxiosResponse } from 'axios';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { DocumentDownloadV2WithMime } from '@deps/models/case/document';
import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { browserLogWarn } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export const downloadDocumentV2 = async (
    documentNumber: string,
    docType: DocumentTypeView,
    clientCode: string
): Promise<DocumentDownloadV2WithMime | null> => {
    try {
        const url = `${baseAppUrl}/api/documents/${documentNumber}/download?clientCode=${clientCode.toUpperCase()}&source=${docType}`;
        const { data } = await client.get<DocumentDownloadV2WithMime, AxiosResponse>(url);
        return data;
    } catch (error: any) {
        browserLogWarn('An error occurred while downloading document', {
            ...parseErrorInformation(error),
            file: 'queries/api/documents',
            function: 'getDocumentDownload',
        });

        return error.response;
    }
};
