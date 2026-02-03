import { getSession } from '@auth0/nextjs-auth0';

import { policyApiBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    withAuthAndLogging,
    LoggingContext,
    parseErrorInformation,
    APIErrorInformation,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

// This endpoint converts a post request from the client into a get request for the gateway apis.
// With over 150 transaction types supported, the query params can get too big for the WAF.
// https://zinnia.atlassian.net/wiki/spaces/AU/pages/6129123331/Policy+Transactions+API+Query+Param+size+issue
export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse,
        loggingContext: LoggingContext
    ) => {
        const session = await getSession(req, res);
        const accessToken = session?.accessToken;
        const { id, planCode } = req.query;
        const body = req.body;

        const url = new URL(
            `${policyApiBaseUrl}/${planCode}/${id}/transactions`
        );
        Object.entries(body).forEach(([key, value]) =>
            url.searchParams.append(key, String(value))
        );
        try {
            const response = await serverApi.get(
                url.toString(),
                {
                    authorization: 'Bearer ' + accessToken,
                },
                loggingContext
            );

            res.status(response.status).json(response.data);
        } catch (e) {
            const errorInformation = parseErrorInformation(
                e
            ) as APIErrorInformation;
            const status = isNaN(Number(errorInformation?.requestStatus))
                ? 500
                : Number(errorInformation?.requestStatus);
            res.status(status).json(
                errorInformation?.requestData ?? {
                    error: 'Something went wrong searching for transactions',
                }
            );
        }
    },
    { file: 'policies/[planCode]/[id]/transactions', function: 'routeHandler' }
);
