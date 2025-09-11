import { PRODUCERS_API_ORIGIN } from '@deps/queries/api/server/v1/producers';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import { withAuthAndLogging } from '@deps/utils/server-logging';

export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        try {
            const producersUrl = `${apiServerBaseUrl}/distributors/v1/producers/${req.query.id}`;

            const producersResponse = await EnterpriseTokenApi.get(
                producersUrl,
                {},
                loggingContext
            );
            const producersResponseObject = await producersResponse.json();

            if (producersResponseObject.message) {
                throwTypedError(
                    producersResponseObject.message,
                    PRODUCERS_API_ORIGIN
                );
            }

            res.json(producersResponseObject);
        } catch (error) {
            res.status(500).json({ message: 'Could not find producer' });
        }
    },
    { file: 'producer', function: 'routeHandler' }
);
