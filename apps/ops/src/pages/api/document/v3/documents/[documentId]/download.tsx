import { getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { lookup } from 'mime-types';

import { DocumentDownloadV2, DocumentDownloadV2WithMime } from '@deps/models/case/document';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { getUserInfoForLogging, logCompliance, logError, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/document/v3`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<DocumentDownloadV2WithMime | any | null>) => {
        const session = await getSession(req, res);
        const userInfo = await getUserInfoForLogging(req, res);
        // Note: parentCarrierCode(clientCode) and documentClassification(source) are *only* used to allow v3 to handle v2 documents.  Can remove once all docs are on v3
        const { documentId, parentCarrierCode, documentClassification } = req.query;
        const accessToken = session?.accessToken;

        const v2DocParams = new URLSearchParams();
        if (parentCarrierCode) {
            v2DocParams.append('parentCarrierCode', parentCarrierCode.toString().toUpperCase());
        }
        if (documentClassification) {
            v2DocParams.append('documentClassification', documentClassification.toString().toUpperCase());
        }

        let url = `${baseUrl}/documents/${documentId}/download`;
        if (v2DocParams.toString()?.length) {
            url += `?${v2DocParams.toString()}`;
        }
        const canUnmask = await canUnmaskPii(session?.accessToken, session?.user?.partyId);

        const loggingContext = {
            parentCarrierCode,
            documentId,
            file: 'document/v3/documents/:documentId/download',
            function: 'routeHandler',
            documentClassification,
            ...userInfo,
        };
        if (!canUnmask) {
            logCompliance('Document Download request denied due to missing unmask pii permission', loggingContext);
            return res.status(403).json({ error: 'Forbidden' });
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

            const mimeType = lookup(data.fileExtension) || '';
            logCompliance('Document Download request successful.  Sending document to client', loggingContext);
            res.json({ ...data, mimeType });
        } catch (error) {
            logError('documents/download:: error', {
                file: 'document/v3/documents/:documentNumber/download',
                function: 'routeHandler',
                ...parseErrorInformation(error),
            });
            res.status(500).json(null);
        }
    },
    { file: 'document/v3/documents/:documentId/download', function: 'routeHandler' }
);

// Addresses NextJS error: API response for this route exceeds 4MB. API Routes are meant to respond quickly.
// Occurs when documents are very large
export const config = {
    api: {
        responseLimit: false,
    },
};
