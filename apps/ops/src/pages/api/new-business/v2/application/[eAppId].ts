import { apiServerBaseUrl } from '@deps/queries/api-config';
import { createEnterpriseTokenRequestProxy } from '@deps/services/enterprise-api-token-http';
import { withAuthAndLogging } from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    createEnterpriseTokenRequestProxy({
        upstreamBaseURL: `${apiServerBaseUrl}/newbusiness`,
        matchedURLPath: '/api/new-business',
        allowedMethods: ['GET', 'PATCH'],
        omittedParams: ['eAppId'],
        getAdditionalHeaders: () => ({ 'Content-Type': 'application/json' }),
    }),
    { file: 'new-business/v2/application/:eAppId', function: 'routeHandler' }
);
