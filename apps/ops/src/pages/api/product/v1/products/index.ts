import { apiServerBaseUrl } from '@deps/queries/api-config';
import { createEnterpriseTokenRequestProxy } from '@deps/services/enterprise-api-token-http';
import { logWarn, withAuthAndLogging } from '@deps/utils/server-logging';

const logPrefix = 'api/product/v1/products';

export default withAuthAndLogging(
    createEnterpriseTokenRequestProxy({
        upstreamBaseURL: apiServerBaseUrl,
        matchedURLPath: '/api',
        allowedMethods: ['GET'],
        onProxyErr: (proxyRes, req, res, logCtx) => {
            if (proxyRes?.data?.message) {
                logWarn(`${logPrefix}::proxyResHandler::error`, {
                    error: proxyRes.data.message,
                    ...logCtx,
                });
            }

            if (proxyRes.status === 404) {
                logWarn(`${logPrefix}::proxyResHandler::not-found`, {
                    error: 'Products were not found',
                    ...logCtx,
                });
            }
        },
    }),
    {
        file: 'product/v1/products',
        function: 'routeHandler',
    }
);
