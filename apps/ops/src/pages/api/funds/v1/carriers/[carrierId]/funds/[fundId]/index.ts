import { apiServerBaseUrl } from '@deps/queries/api-config';
import { createEnterpriseTokenRequestProxy } from '@deps/services/enterprise-api-token-http';
import { logWarn, withAuthAndLogging } from '@deps/utils/server-logging';

const logPrefix = 'api/funds/v1/carriers/[carrierId]/funds/[fundId]';

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
                    error: `Details for carrier (${req.query.carrierId}) fund ${req.query.fundId}  were not found`,
                    ...logCtx,
                });
            }
        },
    }),
    {
        file: 'funds/v1/carriers/[carrierId]/funds/[fundId]',
        function: 'routeHandler',
    }
);
