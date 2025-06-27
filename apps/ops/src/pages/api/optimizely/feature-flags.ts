import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

import { optimizelyService } from '@deps/utils/optimizely/optimizely';
import {
    buildNextApiLoggingContext,
    LoggingContext,
    logWarn,
    parseErrorInformation,
} from '@deps/utils/server-logging';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const loggingContext = {
        ...(await buildNextApiLoggingContext(req, res)),
        file: 'pages/api/optimizely/feature-flags',
        function: 'routeHandler',
    } as LoggingContext;
    try {
        const session = await getSession(req, res);
        if (!session) {
            // likely happening from login.  Short circuit if there isn't a session
            return res.json({});
        }
        const featureFlagDecisions =
            await optimizelyService.getFeatureFlagDecisions(
                session?.user?.sub,
                loggingContext
            );
        res.json(featureFlagDecisions);
    } catch (e) {
        logWarn('error getting feature flags', {
            ...parseErrorInformation(e),
            ...loggingContext,
        });
        res.json({});
    }
}
