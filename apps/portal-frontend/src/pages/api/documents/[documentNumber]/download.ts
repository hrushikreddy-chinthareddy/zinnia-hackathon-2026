import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { lookup } from 'mime-types';

import { DocumentDownload, DocumentDownloadWithMime } from '@deps/models/case/document';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { getUserInfoForLogging, logCompliance, logError, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/document/v2`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<DocumentDownloadWithMime | null>) => {
        const { documentNumber, clientCode, source } = req.query;
        const userInfo = await getUserInfoForLogging(req, res);
        const accessToken = (await getAccessToken(req, res)).accessToken;

        const url = `${baseUrl}/documents/${documentNumber}/download?clientCode=${clientCode}&source=${source}`;

        const loggingContext = {
            clientCode,
            documentNumber,
            file: '/documents/:documentNumber/download',
            function: 'routeHandler',
            source,
            ...userInfo,
        };

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
