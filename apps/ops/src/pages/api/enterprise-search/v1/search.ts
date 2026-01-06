import { getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { ErrorResponse } from '@deps/types/api';
import {
    caseSearchFullMasker,
    caseSearchSanitizer,
} from '@deps/utils/sanitizers';
import { LoggingContext, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

// Will proxy any request made to the next server directly to the gateway apis
// This endpoint is currently only used for case search
// /api/policies/search calls enterprise search directly for policies
export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<AxiosResponse<any> | ErrorResponse>,
        loggingContext: LoggingContext
    ) => {
        const re = new RegExp('^.*?/api');
        const proxyUrl = req.url?.replace(re, apiServerBaseUrl as string);

        const session = await getSession(req, res);
        const canUnmask = await canUnmaskPii(
            session?.accessToken,
            session?.user?.partyId
        );
        // This is only handling masking cases since /api/policies/search calls enterprise search directly
        const masker = canUnmask ? caseSearchSanitizer : caseSearchFullMasker;

        return await requestHandler<any>(
            proxyUrl as string,
            req,
            res,
            loggingContext,
            masker
        );
    },
    { file: 'enterprise-search/v1/search', function: 'routeHandler' }
);
