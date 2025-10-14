import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { DocumentsDisplayType } from '@deps/types/knowledge-base';
import {
    logError,
    logInfo,
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

        const { clientId, docDisplayType, page, size } = req.query;

        if (!clientId || !docDisplayType) {
            logError(
                'Missing required query params: clientId or docDisplayType',
                loggingContext
            );
            return res
                .status(400)
                .json({ error: 'Missing required query params' });
        }

        const url = `${apiServerBaseUrl}/api/v1/clients/${clientId}/documents/${docDisplayType}`;

        const params =
            docDisplayType === DocumentsDisplayType.All
                ? {
                      page: parseInt((page as string) || '0', 0),
                      size: parseInt((size as string) || '10', 10),
                  }
                : undefined;

        try {
            logInfo(
                `Fetching documents for client ${clientId}`,
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
            logError('Error fetching documents', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(error?.status ?? 500).json(error?.data ?? null);
        }
    },
    {
        file: 'knowledge-base/documents/index',
        function: 'routeHandler',
    }
);
