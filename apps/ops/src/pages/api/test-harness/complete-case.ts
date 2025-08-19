import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { isProd } from '@deps/utils/environment.helpers';
import {
    withAuthAndLogging,
    logError,
    parseErrorInformation,
    logCompliance,
} from '@deps/utils/server-logging';

interface CompleteCaseRequest extends NextApiRequest {
    body: {
        caseId: string;
    };
}

export default withAuthAndLogging(
    async (req: CompleteCaseRequest, res: NextApiResponse, loggingContext) => {
        if (req.method !== 'PUT' || isProd()) {
            return res
                .status(405)
                .json({ error: { message: 'Method Not Allowed' } });
        }

        try {
            const caseId = req.body.caseId;
            const token = (await getAccessToken(req, res)).accessToken;

            const url = `${process.env.NEXT_PUBLIC_SE2_BACKEND_URL}/case/v1/support/case/${caseId}/status?status=COMPLETED&ticket=EVGL_DEMO`;
            const { data } = await serverApi.put<any, any>(
                url,
                {},
                { authorization: `Bearer ${token}` },
                loggingContext
            );

            logCompliance('Complete case successful.', loggingContext);
            res.status(200).json({
                data: {
                    ...data,
                },
                error: null,
            });
        } catch (error) {
            logError('test-harness/complete-case:: error', {
                ...parseErrorInformation(error),
                ...loggingContext,
            });
            res.status(500).json({
                data: null,
                error: {
                    message: 'Error completing case',
                },
            });
        }
    },
    { file: 'test-harness/complete-case', function: 'routeHandler' }
);
