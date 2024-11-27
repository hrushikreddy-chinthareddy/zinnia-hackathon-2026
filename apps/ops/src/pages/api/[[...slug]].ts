import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { ErrorResponse } from '@deps/types/api';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<AxiosResponse<any> | ErrorResponse>) => {
        console.log('🚀 ~ req:', req, 'Inside the server api call', 'vijaya..........?????????????');
        const re = new RegExp('^.*?/api');
        const proxyUrl = req.url?.replace(re, apiServerBaseUrl as string);

        return await requestHandler<any>(proxyUrl as string, req, res);
    },
    { file: 'reverse-proxy (slug)', function: 'routeHandler' }
);
