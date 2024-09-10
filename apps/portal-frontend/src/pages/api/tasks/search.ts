import { AxiosResponse } from 'axios';

import { se2ApiServerUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { ErrorResponse } from '@deps/types/api';
import { CaseTaskSearchResponse } from '@deps/types/search';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<AxiosResponse<CaseTaskSearchResponse> | ErrorResponse>) => {
        const re = new RegExp('^.*?/api');
        const proxyUrl = req.url?.replace(re, se2ApiServerUrl as string);

        return await requestHandler<CaseTaskSearchResponse>(proxyUrl as string, req, res);
    },
    { file: 'tasks/search', function: 'routeHandler' }
);
