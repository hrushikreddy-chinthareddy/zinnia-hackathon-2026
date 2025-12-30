import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logError,
    logInfo,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/document/v3`;

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '20mb',
        },
    },
};

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<any | null>,
        loggingContext
    ) => {
        const accessToken = (await getAccessToken(req, res)).accessToken;
        const correlationId = req.body.metadata.correlationId;
        const url = `${baseUrl}/documents`;

        logInfo(`Document upload: requesting: correlationID=${correlationId}`, {
            ...loggingContext,
            url,
            correlationId,
        });
        const response = await fetch(req.body.file);
        const blob = await response.blob();
        if (!blob) return;

        const formData = new FormData();
        formData.append('file', blob, req.body.metadata.sourceFileName);
        formData.append('metadata', JSON.stringify(req.body.metadata));

        try {
            const { data } = await serverApi.post<any, AxiosResponse>(
                url,
                formData,
                {
                    authorization: 'Bearer ' + accessToken,
                    headers: {
                        'Content-type': 'multipart/form-data',
                        'x-correlation-id': correlationId,
                    },
                },
                {
                    ...loggingContext,
                    correlationId,
                }
            );

            logInfo(
                `Document upload request: success: correlationID=${correlationId}`,
                {
                    ...loggingContext,
                    correlationId,
                }
            );
            res.json({ ...data });
        } catch (error) {
            logError(
                `Document upload:: error: correlationID=${correlationId}`,
                {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                    correlationId,
                    url,
                }
            );
            res.status(500).json(null);
        }
    },
    { file: 'documents/upload', function: 'routeHandler' }
);
