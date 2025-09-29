import { apiServerBaseUrl } from '@deps/queries/api-config';
import { isApiResponseError } from '@deps/services/api-proxy';
import { createEnterpriseTokenRequestProxy } from '@deps/services/enterprise-api-token-http';
import { ProducersResponse } from '@deps/types/producers';
import { logWarn, withAuthAndLogging } from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    createEnterpriseTokenRequestProxy<ProducersResponse>({
        upstreamBaseURL: apiServerBaseUrl,
        matchedURLPath: '/api',
        allowedMethods: ['GET'],
        onProxyErr: (proxyRes, req, res, logCtx) => {
            if (isApiResponseError(proxyRes?.data)) {
                logWarn(
                    'api/distributors/v1/producers/producers::proxyResHandler',
                    {
                        error: proxyRes.data.message,
                        ...logCtx,
                    }
                );
            }
        },
    }),
    {
        file: 'distributors/v1/producers/producers',
        function: 'routeHandler',
    }
);
