import { getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { lookup } from 'mime-types';

import { DocumentDownload, DocumentDownloadWithMime } from '@deps/models/case/document';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { getUserInfoForLogging, logCompliance, logError, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/document/v3`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<DocumentDownloadWithMime | any | null>) => {
        const session = await getSession(req, res);
        const userInfo = await getUserInfoForLogging(req, res); // Note: clientCode and source are *only* used to allow v3 to handle v2 documents.  Can remove once all docs are on v3
        const { documentId, clientCode, source } = req.query;
        const accessToken = session?.accessToken;

        const v2DocParams = new URLSearchParams();
        if (clientCode) {
            v2DocParams.append('clientCode', clientCode as string);
        }
        if (source) {
            v2DocParams.append('source', source as string);
        }

        let url = `${baseUrl}/documents/${documentId}/download`;
        if (v2DocParams.toString()?.length) {
            url += `?${v2DocParams.toString()}`;
        }
        const canUnmask = await canUnmaskPii(session?.accessToken, session?.user?.partyId);

        const loggingContext = {
            clientCode,
            documentId,
            file: '/documents/:documentId/download',
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
                    authorization: `Bearer ${accessToken}`,
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
