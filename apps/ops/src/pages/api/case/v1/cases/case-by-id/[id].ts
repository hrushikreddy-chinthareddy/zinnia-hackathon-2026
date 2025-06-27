import { getSession } from '@auth0/nextjs-auth0';

import { se2ApiServerUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import canUnmaskPii from '@deps/queries/server/fga/can-unmask';
import { caseSanitizer, fullyMaskCase } from '@deps/utils/sanitizers';
import { withAuthAndLogging } from '@deps/utils/server-logging';

const ssrCasesUrl = `${se2ApiServerUrl}/cases`;

export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const { id } = req.query;

        const session = await getSession(req, res);
        const canUnmask = await canUnmaskPii(
            session?.accessToken,
            session?.user?.partyId
        );
        const masker = canUnmask ? caseSanitizer : fullyMaskCase;
        return await requestHandler<any>(
            `${ssrCasesUrl}/${id}`,
            req,
            res,
            loggingContext,
            masker
        );
    },
    { file: 'case/v1/cases/case-by-id/:id', function: 'routeHandler' }
);
