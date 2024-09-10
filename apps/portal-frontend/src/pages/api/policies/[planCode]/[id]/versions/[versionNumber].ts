import { AxiosResponse } from 'axios';

import { Policy } from '@deps/models/policy/sor-policy';
import { policyApiBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { ErrorResponse } from '@deps/types/api';
import { policyResponseSanitizer } from '@deps/utils/sanitizers';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<AxiosResponse<Policy> | ErrorResponse>) => {
        const { id, planCode, versionNumber } = req.query;
        return await requestHandler<Policy>(
            `${policyApiBaseUrl}/${planCode}/${id}/versions/${versionNumber}?viewDetails=true`,
            req,
            res,
            policyResponseSanitizer
        );
    },
    { file: 'polices/:planCode/:id/versions/:versionNumber', function: 'routeHandler' }
);
