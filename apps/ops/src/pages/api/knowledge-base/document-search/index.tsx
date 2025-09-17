import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logCompliance,
    logError,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<any | null>,
        loggingContext
    ) => {
        const accessToken = (await getAccessToken(req, res)).accessToken;

        const { clientId, searchTerm, page, size } = req.query;

        if (!clientId || !searchTerm) {
            logError(
                'Missing required query params: clientId or searchTerm',
                loggingContext
            );
            return res
                .status(400)
                .json({ error: 'Missing required query params' });
        }

        const url = `${apiServerBaseUrl}/api/v1/clients/${clientId}/documents/search`;

        const params = {
            searchTerm: searchTerm as string,
            page: parseInt((page as string) || '0', 0),
            size: parseInt((size as string) || '10', 10),
        };

        try {
            logCompliance(
                `Searching documents for client ${clientId}`,
                loggingContext
            );
            const { data, status } = await serverApi.get<any, AxiosResponse>(
                url,
                {
                    headers: {
                        Authorization: 'Bearer ' + accessToken,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    params,
                },
                loggingContext
            );
            res.status(status).json(data);
        } catch (error: any) {
            logError('Error searching documents', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(error?.status ?? 500).json(error?.data ?? null);
        }
    },
    {
        file: 'knowledge-base/documents-search/index',
        function: 'routeHandler',
    }
);
