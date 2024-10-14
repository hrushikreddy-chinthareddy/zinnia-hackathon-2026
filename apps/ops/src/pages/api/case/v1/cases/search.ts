import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { ErrorResponse } from '@deps/types/api';
import { caseSearchSanitizer } from '@deps/utils/sanitizers';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<AxiosResponse<any> | ErrorResponse>) => {
        const re = new RegExp('^.*?/api');
        const proxyUrl = req.url?.replace(re, apiServerBaseUrl as string);

        return await requestHandler<any>(proxyUrl as string, req, res, caseSearchSanitizer);
    },
    { file: 'cases/search', function: 'routeHandler' }
);
