import { AxiosResponse } from 'axios';

import { Policy } from '@deps/models/policy/sor-policy';
import { apiServerBaseUrl, policyApiBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { TupleResponse } from '@deps/types/fga';
import { PromiseSettledStatus } from '@deps/types/promiseSettledStatus';
import { PolicyReferenceSearchResponse } from '@deps/types/search';
import { policyMasker, policySanitizer } from '@deps/utils/sanitizers';
import { logTrace, logWarn, logError, parseErrorInformation, LoggingContext } from '@deps/utils/server-logging';

const policySearch = async ({
    authToken,
    body,
    limit = 5,
    loggingContext: logCtx,
    offset = 0,
    partyId,
}: {
    authToken: string | undefined;
    body: any;
    offset: number;
    limit: number;
    loggingContext: LoggingContext;
    partyId?: string;
}) => {
    const loggingContext = { ...logCtx, file: 'queries/server/policy/policy-search', function: 'policySearch' };
    try {
        const now = performance.now();

        const searchUrl = `${policyApiBaseUrl}/search?offset=${offset}&limit=${limit}`;
        logTrace('policySearch::start', { ...loggingContext, url: searchUrl });
        const { data: searchResponse } = await serverApi.post<PolicyReferenceSearchResponse>(
            searchUrl,
            body,
            {
                authorization: 'Bearer ' + authToken,
            },
            loggingContext
        );

        if (!searchResponse.results) {
            logError('Results array missing from search response', { ...loggingContext, duration: performance.now() - now });
            throw new Error('Search API error');
        }
        logTrace('policySearch::search-complete', { ...loggingContext, duration: performance.now() - now });

        const fgaCall = serverApi.post<any, AxiosResponse<TupleResponse>>(
            `${apiServerBaseUrl}/fga/v1/bulk-check`,
            {
                tuples: searchResponse.results.map(result => ({
                    user: `party:${partyId}`,
                    relation: 'unmask_pii',
                    object: `policy:${result.policyNumber}_${result.planCode}`,
                })),
            },
            {
                authorization: 'Bearer ' + authToken,
            },
            loggingContext
        );

        // ToDo: add to fga queries
        const [fgaResponse, ...settledPromises] = await Promise.allSettled([
            fgaCall,
            ...searchResponse.results.map(result => {
                return serverApi.get(
                    `${policyApiBaseUrl}/${result.planCode}/${result.policyNumber}?viewDetails=true`,
                    {
                        authorization: 'Bearer ' + authToken,
                    },
                    loggingContext
                );
            }),
        ]);

        logTrace('policySearch::getPolicies-complete', { ...loggingContext, duration: performance.now() - now });

        const allowedUnmaskingPolicies =
            fgaResponse?.status === PromiseSettledStatus.fulfilled
                ? fgaResponse.value?.data?.tuples?.reduce((acc, result) => {
                      return { ...acc, [result.object.toLowerCase()]: result.allowed };
                  }, {} as { [key: string]: boolean })
                : {};
        if (fgaResponse.status === PromiseSettledStatus.fulfilled) {
            logTrace('policySearch::fga-complete', { ...loggingContext, duration: performance.now() - now });
        }

        const results = [] as Policy[];
        const failures = [] as string[];
        settledPromises.forEach((settledPromise, index) => {
            if (settledPromise.status === PromiseSettledStatus.fulfilled && settledPromise?.value?.data?.data) {
                const policyTupleKey = `policy:${settledPromise.value.data.data?.policyNumber?.toLowerCase()}_${settledPromise.value.data.data?.product?.planCode?.toLowerCase()}`;
                const masker = allowedUnmaskingPolicies[policyTupleKey] ? policySanitizer : policyMasker;
                results.push(masker(settledPromise.value.data.data));
            } else if (settledPromise.status === PromiseSettledStatus.fulfilled) {
                logWarn('getPolicy::fulfilled-no-data', { promiseValue: settledPromise.value?.data, ...loggingContext });
                failures.push(`${searchResponse.results?.[index]?.planCode}/${searchResponse.results?.[index]?.policyNumber}`);
            } else {
                logWarn('getPolicy::error', {
                    promiseValue: settledPromise?.reason?.data,
                    ...parseErrorInformation(settledPromise?.reason),
                    ...loggingContext,
                });
                failures.push(`${searchResponse.results?.[index]?.planCode}/${searchResponse.results?.[index]?.policyNumber}`);
            }
        });

        if (!results.length && searchResponse?.results?.length) {
            logError('Policy Search returned results, but none were available from getPolicy', { ...loggingContext, failures });
        }

        return { data: { ...searchResponse, results, failures } };
    } catch (error) {
        logError('error', {
            ...parseErrorInformation(error),
            ...loggingContext,
        });
        return { error: { message: 'Something went wrong searching for policies' } };
    }
};

export default policySearch;
