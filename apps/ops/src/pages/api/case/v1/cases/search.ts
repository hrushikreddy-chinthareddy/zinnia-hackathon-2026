import { getSession } from '@auth0/nextjs-auth0';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { caseSearchFullMasker, caseSearchSanitizer } from '@deps/utils/sanitizers';
import { withAuthAndLogging } from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const re = new RegExp('^.*?/api');
        const proxyUrl = req.url?.replace(re, apiServerBaseUrl as string);

        const session = await getSession(req, res);

        const canUnmask = await canUnmaskPii(session?.accessToken, session?.user?.partyId);

        const masker = canUnmask ? caseSearchSanitizer : caseSearchFullMasker;
        return await requestHandler<any>(proxyUrl as string, req, res, loggingContext, masker);
    },
    { file: 'cases/search', function: 'routeHandler' }
);
