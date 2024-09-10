import { AxiosResponse } from 'axios';

import { se2ApiServerUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { ErrorResponse } from '@deps/types/api';
import { caseSanitizer } from '@deps/utils/sanitizers';
import { withAuthAndLogging } from '@deps/utils/server-logging';
const ssrCasesUrl = `${se2ApiServerUrl}/cases`;

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<AxiosResponse<any> | ErrorResponse>) => {
        const { id } = req.query;
        return await requestHandler<any>(`${ssrCasesUrl}/${id}`, req, res, caseSanitizer);
    },
    { file: 'case/v1/cases/case-by-id/:id', function: 'routeHandler' }
);
