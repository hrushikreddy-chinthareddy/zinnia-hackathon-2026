import { AxiosResponse } from 'axios';
import { lookup } from 'mime-types';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { DocumentDownloadV3WithMime } from '@deps/types/documents-v3';
import { ServerQueryReq } from '@deps/types/server-query';
import { logCompliance, logError, parseErrorInformation } from '@deps/utils/server-logging';

interface DocumentProps extends ServerQueryReq {
    documentId: string;
    parentCarrierCode: string;
    documentClassification: string;
}

const documentDownload = async ({
    accessToken,
    partyId,
    documentId,
    parentCarrierCode,
    documentClassification,
}: DocumentProps): Promise<DocumentDownloadV3WithMime | any | null> => {
    const url = `${apiServerBaseUrl}/document/v3/documents/${documentId}/download?parentCarrierCode=${parentCarrierCode.toUpperCase()}&documentClassification=${documentClassification}`;

    const canUnmask = await canUnmaskPii(accessToken, partyId);

    const loggingContext = {
        parentCarrierCode,
        documentId,
        file: '/documents/:documentNumber/download',
        function: 'routeHandler',
        documentClassification,
    };

    if (!canUnmask) {
        logCompliance('Document Download request denied due to missing unmask pii permission', loggingContext);
        return { error: 'Forbidden' };
    }

    logCompliance('Document Download Attempt', loggingContext);
    try {
        const { data } = await serverApi.get<DocumentDownloadV3WithMime, AxiosResponse>(
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

export default documentDownload;
