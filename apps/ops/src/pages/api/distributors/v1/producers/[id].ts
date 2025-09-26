import { apiServerBaseUrl } from '@deps/queries/api-config';
import { createEnterpriseTokenRequestProxy } from '@deps/services/enterprise-api-token-http';
import { logWarn, withAuthAndLogging } from '@deps/utils/server-logging';

const logPrefix = 'api/distributors/v1/producers/[id]';

export default withAuthAndLogging(
    createEnterpriseTokenRequestProxy({
        upstreamBaseURL: apiServerBaseUrl,
        matchedURLPath: '/api',
        allowedMethods: ['GET'],
        omittedParams: ['id'],
        onProxyErr: (proxyRes, req, res, logCtx) => {
            if (proxyRes?.data?.message) {
                logWarn(`${logPrefix}::proxyResHandler::error`, {
                    error: proxyRes.data.message,
                    ...logCtx,
                });
            }

            if (proxyRes.status === 404) {
                logWarn(`${logPrefix}::proxyResHandler::not-found`, {
                    error: 'Producer was not found',
                    producerId: req.query.id,
                    ...logCtx,
                });
            }
        },
    }),
    {
        file: 'distributors/v1/producers/producers/[id]',
        function: 'routeHandler',
    }
);
