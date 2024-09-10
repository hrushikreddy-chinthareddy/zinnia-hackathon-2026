import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

import { optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn } from '@deps/utils/server-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await getSession(req, res);
        if (!session) {
            // likely happening from login.  Short circuit if there isn't a session
            return res.json({});
        }
        const featureFlagDecisions = await optimizelyService.getFeatureFlagDecisions(session?.user?.sub);
        res.json(featureFlagDecisions);
    } catch (e) {
        logWarn('error getting feature flags', { ...parseErrorInformation(e), file: 'optimizely/feature-flags', function: 'routeHandler' });
        res.json({});
    }
}
