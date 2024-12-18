import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { DocumentDownload } from '@deps/models/case/document';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logError, logTrace, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/document/v2`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<DocumentDownload | null>, loggingContext) => {
        const now = performance.now();
        const { documentNumber, clientCode, contractNumber, fChar, taxYear } = req.query;
        const accessToken = (await getAccessToken(req, res)).accessToken;

        const url = `${baseUrl}/taxForms/${documentNumber}?clientCode=${clientCode}&contractNumber=${contractNumber}&fChar=${fChar}&taxYear=${taxYear}`;

        logTrace('documentPreview::start', loggingContext);

        try {
            const { data } = await serverApi.get<DocumentDownload, AxiosResponse>(
                url,
                {
                    authorization: `Bearer ${accessToken}`,

                    headers: {
                        'Content-Type': 'application/pdf',
                    },
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
    { file: 'documents/tax-form/:documentNumber/preview', function: 'routeHandler' }
);

// Addresses NextJS error: API response for this route exceeds 4MB. API Routes are meant to respond quickly.
// Occurs when documents are very large
export const config = {
    api: {
        responseLimit: false,
    },
};
