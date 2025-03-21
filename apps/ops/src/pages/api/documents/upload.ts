import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logCompliance, logError, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = `${apiServerBaseUrl}/document/v3`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<any | null>, loggingContext) => {
        const accessToken = (await getAccessToken(req, res)).accessToken;

        const url = `${baseUrl}/documents`;

        logCompliance('Document Upload Attempt', loggingContext);
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
                    },
                },
                loggingContext
            );

            logCompliance('Document Upload request successful.', loggingContext);
            res.json({ ...data });
        } catch (error) {
            logError('documents/upload:: error', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(500).json(null);
        }
    },
    { file: 'documents/upload', function: 'routeHandler' }
);
