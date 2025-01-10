import { getSession } from '@auth0/nextjs-auth0';

import { policyApiBaseUrl } from '@deps/queries/api-config';
import policySearch from '@deps/queries/server/policy/policy-search';
import { PolicySearchResponse } from '@deps/types/search';
import { logTrace, logWarn, logError, withAuthAndLogging, parseErrorInformation } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<PolicySearchResponse | { message: string }>, loggingContext: object) => {
        try {
            const now = performance.now();
            const session = await getSession(req, res);
            const accessToken = session?.accessToken;

            const { offset = 0, limit = 5 } = req.query;
            const searchUrl = `${policyApiBaseUrl}/search?offset=${offset}&limit=${limit}`;
            logTrace('policySearch::start', { url: searchUrl, ...loggingContext });
            const { data, error } = await policySearch({
                authToken: accessToken,
                body: req.body,
                offset: offset as number,
                limit: limit as number,
                loggingContext,
                partyId: session?.user?.partyId,
            });
            if (!data) {
                logWarn('policySearch::no data', { ...loggingContext, duration: performance.now() - now });
                throw new Error(error?.message ?? 'policySearch error');
            }
            res.json(data);
        } catch (error) {
            logError('error', {
                ...parseErrorInformation(error),
                file: 'policies/search',
                function: 'routeHandler',
            });
            res.status(500).json({ message: 'Something went wrong searching for policies' });
        }
    },
    { file: 'policies/search', function: 'routeHandler' }
);
