import { getSession } from '@auth0/nextjs-auth0';

import {
    enterpriseSearchApiServerUrl,
    policyApiBaseUrl,
} from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { PolicyReferenceSearchResponse } from '@deps/types/search';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { optimizelyService } from '@deps/utils/optimizely/optimizely';
import {
    logTrace,
    logWarn,
    withAuthAndLogging,
    parseErrorInformation,
    LoggingContext,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<
            PolicyReferenceSearchResponse | { message: string }
        >,
        loggingContext: LoggingContext
    ) => {
        try {
            const now = performance.now();
            const session = await getSession(req, res);
            const accessToken = session?.accessToken;

            const { offset = 0, limit = 5 } = req.query;
            const featureFlagDecisions =
                await optimizelyService.getFeatureFlagDecisions(
                    session?.user?.sub,
                    loggingContext
                );
            const searchUrl = featureFlagDecisions?.[
                FEATURE_FLAGS.ENTERPRISE_SEARCH_POLICY
            ]
                ? `${enterpriseSearchApiServerUrl}?searchEntity=policy&offset=${offset}&limit=${limit}`
                : `${policyApiBaseUrl}/search?offset=${offset}&limit=${limit}`;
            logTrace('policySearch::start', {
                ...loggingContext,
                url: searchUrl,
            });
            const { data: searchResponse } =
                await serverApi.post<PolicyReferenceSearchResponse>(
                    searchUrl,
                    req.body,
                    {
                        authorization: 'Bearer ' + accessToken,
                    },
                    loggingContext
                );
            logTrace('policySearch::complete', {
                ...loggingContext,
                url: searchUrl,
                duration: performance.now() - now,
            });
            res.json(searchResponse);
        } catch (e) {
            logWarn('policy search route handler:: something went wrong', {
                ...loggingContext,
                ...parseErrorInformation(e),
            });
            res.status(500).json({
                message: 'Something went wrong searching for policies',
            });
        }
    },
    { file: 'policies/search', function: 'routeHandler' }
);
