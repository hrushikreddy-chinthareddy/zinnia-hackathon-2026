import { getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { lookup } from 'mime-types';

import { DocumentDownloadV2, DocumentDownloadV2WithMime } from '@deps/models/case/document';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { logCompliance, logError, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/document/v2`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<DocumentDownloadV2WithMime | any | null>, loggingContext) => {
        const { documentNumber, clientCode, source } = req.query;
        const session = await getSession(req, res);

        const url = `${baseUrl}/documents/${documentNumber}/download?clientCode=${clientCode}&source=${source}`;
        const canUnmask = await canUnmaskPii(session?.accessToken, session?.user?.partyId);

        if (!canUnmask) {
            logCompliance('Document Download request denied due to missing unmask pii permission', loggingContext);
            return res.status(403).json({ error: 'Forbidden' });
        }

        logCompliance('Document Download Attempt', loggingContext);
        try {
            const { data } = await serverApi.get<DocumentDownloadV2, AxiosResponse>(
                url,
                {
                    authorization: `Bearer ${session?.accessToken}`,
                },
                loggingContext
            );

            const mimeType = lookup(data.fileExtension) || '';
            logCompliance('Document Download request successful.  Sending document to client', loggingContext);
            res.json({ ...data, mimeType });
        } catch (error) {
            logError('documents/download:: error', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(500).json(null);
        }
    },
    { file: 'documents/:documentNumber/download', function: 'routeHandler' }
);

// Addresses NextJS error: API response for this route exceeds 4MB. API Routes are meant to respond quickly.
// Occurs when documents are very large
export const config = {
    api: {
        responseLimit: false,
    },
};
