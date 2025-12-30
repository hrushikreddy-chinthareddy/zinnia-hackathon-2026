import { getSession } from '@auth0/nextjs-auth0';

import { policyApiBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { PromiseSettledStatus } from '@deps/types/promiseSettledStatus';
import {
    PolicyReferenceSearchResponse,
    PolicySearchResponse,
} from '@deps/types/search';
import { policySanitizer } from '@deps/utils/sanitizers';
import {
    logTrace,
    logWarn,
    logError,
    withAuthAndLogging,
    parseErrorInformation,
} from '@deps/utils/server-logging';
import { Policy } from '@zinnia/api-types/types/sor';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<PolicySearchResponse | { message: string }>,
        loggingContext
    ) => {
        try {
            const now = performance.now();
            const session = await getSession(req, res);
            const accessToken = session?.accessToken;

            const { offset = 0, limit = 5 } = req.query;
            const searchUrl = `${policyApiBaseUrl}/search?offset=${offset}&limit=${limit}`;
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

            if (!searchResponse.results) {
                logError('Results array missing from search response', {
                    ...loggingContext,
                    duration: performance.now() - now,
                });
                throw new Error('Search API error');
            }
            logTrace('policySearch::search-complete', {
                ...loggingContext,
                duration: performance.now() - now,
            });

            const settledPromises = await Promise.allSettled(
                searchResponse.results.map((result) => {
                    return serverApi.get(
                        `${policyApiBaseUrl}/${result.planCode}/${result.policyNumber}?viewDetails=true`,
                        {
                            authorization: 'Bearer ' + accessToken,
                        },
                        loggingContext
                    );
                })
            );
            logTrace('policySearch::getPolicies-complete', {
                ...loggingContext,
                duration: performance.now() - now,
            });

            const results = [] as Policy[];
            const failures = [] as string[];
            settledPromises.forEach((settledPromise, index) => {
                if (
                    settledPromise.status === PromiseSettledStatus.fulfilled &&
                    settledPromise?.value?.data?.data
                ) {
                    results.push(
                        policySanitizer(settledPromise.value.data.data)
                    );
                } else if (
                    settledPromise.status === PromiseSettledStatus.fulfilled
                ) {
                    logWarn('getPolicy::fulfilled-no-data', {
                        promiseValue: settledPromise.value?.data,
                        ...loggingContext,
                    });
                    failures.push(
                        `${searchResponse.results?.[index]?.planCode}/${searchResponse.results?.[index]?.policyNumber}`
                    );
                } else {
                    logWarn('getPolicy::error', {
                        promiseValue: settledPromise?.reason?.data,
                        ...parseErrorInformation(settledPromise?.reason),
                        ...loggingContext,
                    });
                    failures.push(
                        `${searchResponse.results?.[index]?.planCode}/${searchResponse.results?.[index]?.policyNumber}`
                    );
                }
            });

            if (!results.length && searchResponse?.results?.length) {
                logError(
                    'Policy Search returned results, but none were available from getPolicy',
                    { ...loggingContext, failures }
                );
            }

            res.json({ ...searchResponse, results, failures });
        } catch (error) {
            logError('error', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(500).json({
                message: 'Something went wrong searching for policies',
            });
        }
    },
    { file: 'policies/searchIncludeDetails', function: 'routeHandler' }
);
