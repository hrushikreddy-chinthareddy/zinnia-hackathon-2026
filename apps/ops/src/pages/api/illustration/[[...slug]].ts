import { apiServerBaseUrl } from '@deps/queries/api-config';
import { createEnterpriseTokenRequestProxy } from '@deps/services/enterprise-api-token-http';
import { FgaRelation, FgaRoles } from '@deps/utils/auth';
import { withAuthAndLogging } from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    createEnterpriseTokenRequestProxy({
        upstreamBaseURL: apiServerBaseUrl,
        matchedURLPath: '/api',
        allowedMethods: ['GET', 'PUT', 'POST', 'PATCH'],
        omittedParams: ['slug'],
        fgaGuard: {
            object: FgaRoles.ILLUSTRATIONS_EXPERIENCE,
            relation: FgaRelation.UiAccess,
        },
        getAdditionalHeaders: (req) => {
            if (req.method !== 'GET') {
                return { 'Content-Type': 'application/json' };
            }
        },
    }),
    { file: 'illustration reverse-proxy (slug)', function: 'routeHandler' }
);
