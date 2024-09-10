import { AxiosResponse } from 'axios';

import { policyApiBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { ErrorResponse } from '@deps/types/api';
import { policyResponseSanitizer } from '@deps/utils/sanitizers';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<AxiosResponse<any> | ErrorResponse>) => {
        const { id, planCode } = req.query;
        return await requestHandler<any>(`${policyApiBaseUrl}/${planCode}/${id}?viewDetails=true`, req, res, policyResponseSanitizer);
    },
    { file: 'polices/:planCode/:id', function: 'routeHandler' }
);
