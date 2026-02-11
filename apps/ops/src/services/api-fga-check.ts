import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
    logError,
    LoggingContext,
    parseErrorInformation,
} from '@deps/utils/server-logging';
import { BulkCheckResponse, CheckRequest } from '@zinnia/api-types/types/fga';

export type AnonCheckRequest = Omit<CheckRequest, 'user'>;

const FGA_BULK_CHECK_URL = `${apiServerBaseUrl}/fga/v1/bulk-check`;

export const buildFgaChecker =
    (tuples: AnonCheckRequest[]) =>
    async (authToken: string, logCtx: LoggingContext) => {
        const loggingContext = {
            ...logCtx,
            file: 'services/api-fga-check',
            function: 'checkFgaTuples',
        } as LoggingContext;

        if (!tuples.length) {
            // Nothing to check
            return true;
        }

        const userPartyId = logCtx.user?.partyId;

        if (!userPartyId) {
            return false;
        }

        let response: AxiosResponse<BulkCheckResponse>;

        const bulkRequestBody = {
            tuples: tuples.map(({ object, relation }) => ({
                object,
                relation,
                user: `party:${userPartyId}`,
            })),
        };

        try {
            response = await serverApi.request(
                {
                    url: FGA_BULK_CHECK_URL,
                    method: 'POST',
                    data: bulkRequestBody,
                    authorization: `Bearer ${authToken}`,
                },
                logCtx
            );
        } catch (err) {
            logError('Error requesting fga bulk check', {
                tuples: bulkRequestBody,
                ...parseErrorInformation(err),
                ...loggingContext,
            });
            return false;
        }

        return response.data.tuples.every(({ allowed }) => allowed);
    };
