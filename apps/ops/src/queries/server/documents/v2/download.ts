import { AxiosResponse } from 'axios';
import { lookup } from 'mime-types';

import { DocumentDownloadV2, DocumentDownloadV2WithMime } from '@deps/models/case/document';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { ServerQueryReq } from '@deps/types/server-query';
import { logCompliance, logError, parseErrorInformation } from '@deps/utils/server-logging';

interface DocumentProps extends ServerQueryReq {
    documentId: string;
    clientCode: string;
    source: string;
}

const baseUrl = `${apiServerBaseUrl}/document/v2`;

const documentDownloadV2 = async ({
    accessToken,
    partyId,
    documentId,
    clientCode,
    source,
}: DocumentProps): Promise<DocumentDownloadV2WithMime | any | null> => {
    const url = `${baseUrl}/documents/${documentId}/download?clientCode=${clientCode}&source=${source}`;
    const canUnmask = await canUnmaskPii(accessToken, partyId);

    const loggingContext = {
        clientCode,
        documentId,
        file: '/documents/:documentNumber/download',
        function: 'routeHandler',
        source,
    };

    if (!canUnmask) {
        logCompliance('Document Download request denied due to missing unmask pii permission', loggingContext);
        return { error: 'Forbidden' };
    }

    logCompliance('Document Download Attempt', loggingContext);
    try {
        const { data } = await serverApi.get<DocumentDownloadV2, AxiosResponse>(
            url,
            {
                authorization: `Bearer ${accessToken}`,
            },
            loggingContext
        );

        logCompliance('Document Download request successful.  Sending document to client', loggingContext);

        const mimeType = lookup(data.fileExtension) || '';
        return { ...data, mimeType };
    } catch (error) {
        logError('documents/download:: error', {
            file: 'documents/:documentNumber/download',
            function: 'routeHandler',
            ...parseErrorInformation(error),
        });
        return null;
    }
};

export default documentDownloadV2;
