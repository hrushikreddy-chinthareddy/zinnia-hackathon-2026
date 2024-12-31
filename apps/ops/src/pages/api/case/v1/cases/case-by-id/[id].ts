import { getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { se2ApiServerUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { ErrorResponse } from '@deps/types/api';
import { caseSanitizer, fullyMaskCase } from '@deps/utils/sanitizers';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';
const ssrCasesUrl = `${se2ApiServerUrl}/cases`;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<AxiosResponse<any> | ErrorResponse>) => {
        const { id } = req.query;

        const session = await getSession(req, res);
        const canUnmask = await canUnmaskPii(session?.accessToken, session?.user?.partyId);
        const masker = canUnmask ? caseSanitizer : fullyMaskCase;
        return await requestHandler<any>(`${ssrCasesUrl}/${id}`, req, res, masker);
    },
    { file: 'case/v1/cases/case-by-id/:id', function: 'routeHandler' }
);
