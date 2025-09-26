import { apiServerBaseUrl } from '@deps/queries/api-config';
import { isApiResponseError } from '@deps/services/api-proxy';
import { createEnterpriseTokenRequestProxy } from '@deps/services/enterprise-api-token-http';
import { GetDownlineResponse } from '@deps/types/producers';
import { logWarn, withAuthAndLogging } from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    createEnterpriseTokenRequestProxy<GetDownlineResponse[][]>({
        upstreamBaseURL: apiServerBaseUrl,
        matchedURLPath: '/api',
        allowedMethods: ['GET'],
        omittedParams: ['sellingCode'],
        onProxyErr: (proxyRes, req, res, logCtx) => {
            const logPrefix =
                'api/distributors/v1/hierarchies/selling-code/[sellingCode]/downline:routeHandler';

            if (isApiResponseError(proxyRes.data)) {
                logWarn(`${logPrefix}::error`, {
                    error: proxyRes.data.message,
                    ...logCtx,
                });
            }
        },
    }),
    {
        file: 'distributors/v1/hierarchies/selling-code/:selling-code/downline',
        function: 'routeHandler',
    }
);
