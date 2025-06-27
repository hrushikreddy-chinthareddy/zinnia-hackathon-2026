import { getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl, policyApiBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { CheckTupleResponse } from '@deps/types/fga';
import {
    fullyMaskPolicyResponse,
    policyResponseSanitizer,
} from '@deps/utils/sanitizers';
import { withAuthAndLogging } from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const session = await getSession(req, res);
        const { id, planCode } = req.query;
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
        const masker = unmaskingResponse.data?.allowed
            ? policyResponseSanitizer
            : fullyMaskPolicyResponse;
        return await requestHandler<any>(
            `${policyApiBaseUrl}/${planCode}/${id}?viewDetails=true`,
            req,
            res,
            loggingContext,
            masker
        );
    },
    { file: 'polices/:planCode/:id', function: 'routeHandler' }
);
