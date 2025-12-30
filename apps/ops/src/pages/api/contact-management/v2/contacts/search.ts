import { getSession } from '@auth0/nextjs-auth0';

import { contactManagementApiServerUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { maskContactManagementSearch } from '@deps/utils/sanitizers/contact-management';
import { withAuthAndLogging } from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const session = await getSession(req, res);
        const canUnmask = await canUnmaskPii(
            session?.accessToken,
            session?.user?.partyId
        );
        const masker = canUnmask ? undefined : maskContactManagementSearch;
        return await requestHandler<any>(
            `${contactManagementApiServerUrl}/search`,
            req,
            res,
            loggingContext,
            masker
        );
    },
    { file: 'contact-management/v2/contacts/search', function: 'routeHandler' }
);
