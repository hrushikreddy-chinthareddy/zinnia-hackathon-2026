import { getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { DocumentDownloadV2 } from '@deps/models/case/document';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { logCompliance, logError, logTrace, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/document/v3`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<DocumentDownloadV2 | any | null>, loggingContext) => {
        const now = performance.now();
        const session = await getSession(req, res);
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
        const canUnmask = await canUnmaskPii(accessToken, session?.user?.partyId);

        logTrace('documentPreview::start', loggingContext);
        if (!canUnmask) {
            logCompliance('Document Preview request denied due to missing unmask pii permission', loggingContext);
            return res.status(403).json({ error: 'Forbidden' });
        }

        try {
            const { data } = await serverApi.get<DocumentDownloadV2, AxiosResponse>(
                url,
                {
                    authorization: `Bearer ${accessToken}`,
                },
                loggingContext
            );
            logTrace('documentPreview::download-complete', { ...loggingContext, duration: performance.now() - now });

            res.json(data);
        } catch (error) {
            logError('documents/preview:: error', {
                ...parseErrorInformation(error),
                requestUrl: url,
                duration: performance.now() - now,
                ...loggingContext,
            });
            res.status((error as Response)?.status ?? 500).json(null);
        }
    },
    { file: 'document/v3/documents/:documentId/preview', function: 'routeHandler' }
);

// Addresses NextJS error: API response for this route exceeds 4MB. API Routes are meant to respond quickly.
// Occurs when documents are very large
export const config = {
    api: {
        responseLimit: false,
    },
};
