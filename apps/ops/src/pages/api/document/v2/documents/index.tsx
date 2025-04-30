import { getSession } from '@auth0/nextjs-auth0';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { withAuthAndLogging } from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const session = await getSession(req, res);
        const re = new RegExp('^.*?/api');
        const proxyUrl = req.url?.replace(re, apiServerBaseUrl as string);

        // Do not allow users who can't see PII to see documents.
        const canUnmask = await canUnmaskPii(session?.accessToken, session?.user?.partyId);
        if (!canUnmask) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        return await requestHandler<any>(proxyUrl as string, req, res, loggingContext);
    },
    { file: 'document/v2/documents', function: 'routeHandler' }
);
