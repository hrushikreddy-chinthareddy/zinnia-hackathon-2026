import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            const url = new URL(`/distributors/v1/producers/${req.query.id}`, apiServerBaseUrl);

            return await requestHandler(url.toString(), req, res);
        } catch (error) {
            res.status(500).json({ message: 'Could not find producer' });
        }
    },
    { file: 'producer', function: 'routeHandler' }
);
