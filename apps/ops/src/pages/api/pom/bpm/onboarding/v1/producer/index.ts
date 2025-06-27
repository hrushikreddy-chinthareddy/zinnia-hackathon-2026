import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { withAuthAndLogging } from '@deps/utils/server-logging';

export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        try {
            const proxyUrl = `${apiServerBaseUrl}/bpm/onboarding/v1/producer`;
            return await requestHandler(
                proxyUrl as string,
                req,
                res,
                loggingContext
            );
        } catch (error) {
            // TODO: we should add logging here probably
            res.status(500).json({ message: 'Could not create producer' });
        }
    },
    { file: 'producer', function: 'routeHandler' }
);
