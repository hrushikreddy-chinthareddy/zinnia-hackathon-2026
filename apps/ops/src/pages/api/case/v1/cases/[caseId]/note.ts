import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { ErrorResponse } from '@deps/types/api';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@auth0/nextjs-auth0';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<AxiosResponse<any> | any | ErrorResponse>) => {
        const session = await getSession(req, res);
        const re = new RegExp('^.*?/api');
        const proxyUrl = req.url?.replace(re, apiServerBaseUrl as string);

        // Do not allow users who can't see PII to see case notes.
        const canUnmask = await canUnmaskPii(session?.accessToken, session?.user?.partyId);
        if (!canUnmask) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        return await requestHandler<any>(proxyUrl as string, req, res);
    },
    { file: 'case/v1/cases/:id/note', function: 'routeHandler' }
);
