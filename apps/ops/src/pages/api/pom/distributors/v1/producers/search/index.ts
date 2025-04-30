import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { withAuthAndLogging } from '@deps/utils/server-logging';

export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        try {
            const { limit = '10', offset = '0' } = req.query;
            const url = new URL('/distributors/v1/producers/search', apiServerBaseUrl);

            url.searchParams.append('limit', limit.toString());
            url.searchParams.append('offset', offset.toString());

            return await requestHandler(url.toString(), req, res, loggingContext);
        } catch (error) {
            res.status(500).json({ message: 'Could not search for producers' });
        }
    },
    { file: 'producer', function: 'routeHandler' }
);
