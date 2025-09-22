import { getAccessToken } from '@auth0/nextjs-auth0';
import { UserResponse } from '@xd/api-types/dist/generated-types/knowledgebase';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logError,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<UserResponse[] | null>,
        loggingContext
    ) => {
        const accessToken = (await getAccessToken(req, res)).accessToken;

        const { searchTerm = '' } = req.body;

        if (
            !searchTerm ||
            typeof searchTerm !== 'string' ||
            searchTerm.trim().length === 0
        ) {
            return res.status(400).json(null);
        }

        const url = `${apiServerBaseUrl}/api/v1/users/search`;

        try {
            const { data } = await serverApi.post<
                any,
                AxiosResponse<UserResponse[]>
            >(
                url,
                JSON.stringify({
                    searchTerm: searchTerm.toString().trim(),
                }),
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                },
                loggingContext
            );

            res.status(200).json(data);
        } catch (error: any) {
            logError('Error searching users', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(error?.status ?? 500).json(error?.data ?? null);
        }
    },
    {
        file: 'knowledge-base/users/search/index',
        function: 'routeHandler',
    }
);
