import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logCompliance,
    logError,
    logTrace,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';
import { TaxformDownloadResponse } from '@zinnia/api-types/types/documents-v3';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/document/v3`;

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<TaxformDownloadResponse | null>,
        loggingContext
    ) => {
        const now = performance.now();
        const { formId, clientCode, contractNumber, fChar, taxYear, planCode } =
            req.query;
        const accessToken = (await getAccessToken(req, res)).accessToken;

        const url = `${baseUrl}/tax-forms/${formId}/download?clientCode=${clientCode}&contractNumber=${contractNumber}&fChar=${fChar}&taxYear=${taxYear}&planCode=${planCode}`;

        logTrace('taxFormDownload::start', loggingContext);
        logCompliance('Tax Form Download Attempt', loggingContext);

        try {
            const { data } = await serverApi.get<
                TaxformDownloadResponse,
                AxiosResponse
            >(
                url,
                {
                    authorization: `Bearer ${accessToken}`,

                    headers: {
                        'Content-Type': 'application/pdf',
                    },
                },
                loggingContext
            );
            logTrace('taxFormDownload::download-complete', {
                ...loggingContext,
                duration: performance.now() - now,
            });

            res.json(data);
        } catch (error) {
            logError('documents/tax-forms/:formId/download:: error', {
                ...parseErrorInformation(error),
                requestUrl: url,
                duration: performance.now() - now,
                ...loggingContext,
            });
            res.status((error as Response)?.status ?? 500).json(null);
        }
    },
    { file: 'document/v3/tax-forms/:formId/download', function: 'routeHandler' }
);

// Addresses NextJS error: API response for this route exceeds 4MB. API Routes are meant to respond quickly.
// Occurs when documents are very large
export const config = {
    api: {
        responseLimit: false,
    },
};
