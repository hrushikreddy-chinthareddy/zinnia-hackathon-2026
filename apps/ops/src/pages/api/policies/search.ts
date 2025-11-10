import { getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import {
    apiServerBaseUrl,
    enterpriseSearchApiServerUrl,
    policyApiBaseUrl,
} from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { CheckTupleResponse } from '@deps/types/fga';
import { PolicyReferenceSearchResponse } from '@deps/types/search';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { optimizelyService } from '@deps/utils/optimizely/optimizely';
import { policySearchResponseSanitizer } from '@deps/utils/sanitizers';
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
            const { id, planCode } = req.query;

            const { offset = 0, limit = 5, sortBy, sortOrder } = req.query;

            const featureFlagDecisions =
                await optimizelyService.getFeatureFlagDecisions(
                    session?.user?.sub,
                    loggingContext
                );

            const searchQueryParams = `offset=${offset}&limit=${limit}${
                sortBy ? `&sortBy=${sortBy}` : ''
            }${sortOrder ? `&sortOrder=${sortOrder}` : ''}`;

            const enterpriseSearchUrl = `${enterpriseSearchApiServerUrl}?searchEntity=policy&${searchQueryParams}`;

            const oldPolicySearchUrl = `${policyApiBaseUrl}/search?${searchQueryParams}`;

            //TODO: We will need to add an additional check that the user is NOT an AE user
            const searchUrl = featureFlagDecisions?.[
                FEATURE_FLAGS.ENTERPRISE_SEARCH_POLICY
            ]
                ? enterpriseSearchUrl
                : oldPolicySearchUrl;

            logTrace('policySearch::start', {
                ...loggingContext,
                url: searchUrl,
            });

            const unmaskingResponse = await serverApi.post<
                any,
                AxiosResponse<CheckTupleResponse>
            >(
                `${apiServerBaseUrl}/fga/v1/check`,
                {
                    user: `party:${session?.user?.partyId}`,
                    relation: 'unmask_pii',
                    object: `policy:${id}_${planCode}`,
                },
                { authorization: 'Bearer ' + session?.accessToken },
                loggingContext
            );

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

            // Do not show full SSN if the user is not authorized to view it
            const masker = unmaskingResponse.data?.allowed
                ? searchResponse
                : policySearchResponseSanitizer(searchResponse);

            res.json(masker);
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
