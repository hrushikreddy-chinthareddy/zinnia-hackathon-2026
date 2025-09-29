import { apiServerBaseUrl } from '@deps/queries/api-config';
import { isApiResponseError } from '@deps/services/api-proxy';
import { createEnterpriseTokenRequestProxy } from '@deps/services/enterprise-api-token-http';
import { GetHierarchyResponse } from '@deps/types/producers';
import { logWarn, withAuthAndLogging } from '@deps/utils/server-logging';

const logPrefix = 'POM::getDownlineBySellingcode';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    createEnterpriseTokenRequestProxy<GetHierarchyResponse>({
        upstreamBaseURL: apiServerBaseUrl,
        matchedURLPath: '/api',
        allowedMethods: ['GET'],
        omittedParams: ['sellingCode'],
        onProxyRes: (proxyRes, req, res, logCtx) => {
            if (!proxyRes?.data?.upline) {
                return logWarn(`${logPrefix}:proxyResHandler::missing-upline`, {
                    ...logCtx,
                    error: 'Hierarchy does not have an upline',
                    hierarchySellingcode: req.query.sellingCode,
                });
            }

            const hasUplineAgency = proxyRes.data.upline.find(
                (uplineItem) => uplineItem?.producerType === 'GeneralAgency'
            );

            if (!hasUplineAgency) {
                logWarn(`${logPrefix}:proxyResHandler::missing-upline-agency`, {
                    ...logCtx,
                    error: 'Hierarchy upline does not have a GeneralAgency',
                    hierarchySellingcode: req.query.sellingCode,
                });
            }
        },
        onProxyErr: (proxyRes, req, res, logCtx) => {
            if (isApiResponseError(proxyRes.data)) {
                logWarn(`${logPrefix}:proxyErrHandler::error`, {
                    ...logCtx,
                    error: proxyRes.data.message,
                });
            }

            if (proxyRes.status === 404) {
                logWarn(`${logPrefix}:proxyErrHandler::not-found`, {
                    ...logCtx,
                    error: 'Hierarchy was not found',
                    hierarchySellingCode: req.query.sellingCode,
                });
            }
        },
    }),
    {
        file: 'distributors/v1/hierarchies/selling-code/:selling-code',
        function: 'routeHandler',
    }
);
