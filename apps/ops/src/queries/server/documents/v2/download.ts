import { AxiosResponse } from 'axios';
import { lookup } from 'mime-types';

import { DocumentDownloadV2, DocumentDownloadV2WithMime } from '@deps/models/case/document';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { ServerQueryReq } from '@deps/types/server-query';
import { logCompliance, logError, LoggingContext, parseErrorInformation } from '@deps/utils/server-logging';

interface DocumentProps extends ServerQueryReq {
    documentId: string;
    clientCode: string;
    source: string;
    loggingContext: LoggingContext;
}

const baseUrl = `${apiServerBaseUrl}/document/v2`;

const documentDownloadV2 = async ({
    accessToken,
    partyId,
    documentId,
    clientCode,
    source,
    loggingContext,
}: DocumentProps): Promise<DocumentDownloadV2WithMime | any | null> => {
    const url = `${baseUrl}/documents/${documentId}/download?clientCode=${clientCode}&source=${source}`;
    const canUnmask = await canUnmaskPii(accessToken, partyId);

    const logCtx = {
        ...loggingContext,
        file: '/documents/:documentNumber/download',
        function: 'routeHandler',
        inputs: { documentId, clientCode, source },
    };

    if (!canUnmask) {
        logCompliance('Document Download request denied due to missing unmask pii permission', logCtx);
        return { error: 'Forbidden' };
    }

    logCompliance('Document Download Attempt', logCtx);
    try {
        const { data } = await serverApi.get<DocumentDownloadV2, AxiosResponse>(
            url,
            {
                authorization: `Bearer ${accessToken}`,
            },
            logCtx
        );

        logCompliance('Document Download request successful.  Sending document to client', logCtx);

        const mimeType = lookup(data.fileExtension) || '';
        return { ...data, mimeType };
    } catch (error) {
        logError('documents/download:: error', {
            ...logCtx,
            ...parseErrorInformation(error),
        });
        return null;
    }
};

export default documentDownloadV2;
