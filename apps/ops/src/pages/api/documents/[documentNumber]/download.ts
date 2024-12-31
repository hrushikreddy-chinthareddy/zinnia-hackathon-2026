import { getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { lookup } from 'mime-types';

import { DocumentDownload, DocumentDownloadWithMime } from '@deps/models/case/document';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { getUserInfoForLogging, logCompliance, logError, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';

const baseUrl = `${apiServerBaseUrl}/document/v2`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<DocumentDownloadWithMime | any | null>) => {
        const { documentNumber, clientCode, source } = req.query;
        const session = await getSession(req, res);
        const userInfo = await getUserInfoForLogging(req, res);

        const url = `${baseUrl}/documents/${documentNumber}/download?clientCode=${clientCode}&source=${source}`;
        const canUnmask = await canUnmaskPii(session?.accessToken, session?.user?.partyId);

        const loggingContext = {
            clientCode,
            documentNumber,
            file: '/documents/:documentNumber/download',
            function: 'routeHandler',
            source,
            ...userInfo,
        };
        if (!canUnmask) {
            logCompliance('Document Download request denied due to missing unmask pii permission', loggingContext);
            return res.status(403).json({ error: 'Forbidden' });
        }

        logCompliance('Document Download Attempt', loggingContext);
        try {
            const { data } = await serverApi.get<DocumentDownload, AxiosResponse>(
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
                file: 'documents/:documentNumber/download',
                function: 'routeHandler',
                ...parseErrorInformation(error),
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
