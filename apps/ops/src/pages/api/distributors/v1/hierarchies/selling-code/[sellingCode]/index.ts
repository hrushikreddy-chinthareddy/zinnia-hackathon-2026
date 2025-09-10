import { PRODUCERS_API_ORIGIN } from '@deps/queries/api/server/v1/producers';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import {
    logWarn,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const { sellingCode } = req.query;

        try {
            const producersUrl = `${apiServerBaseUrl}/distributors/v1/hierarchies/selling-code/${sellingCode}`;
            const producersHierarchyResponse = await EnterpriseTokenApi.get(
                producersUrl,
                {},
                loggingContext
            );
            const producersHierarchyResponseObject =
                await producersHierarchyResponse.json();

            if (producersHierarchyResponseObject.message) {
                throwTypedError(
                    producersHierarchyResponseObject.message,
                    PRODUCERS_API_ORIGIN
                );
            }

            res.json(producersHierarchyResponseObject);
        } catch (error: any) {
            logWarn(
                'distributors/v1/hierarchies/selling-code/:selling-code::error',
                {
                    ...parseErrorInformation(error),
                    ...loggingContext,
                }
            );
            res.status(500).json(null);
        }
    },
    {
        file: 'distributors/v1/hierarchies/selling-code/:selling-code',
        function: 'routeHandler',
    }
);
