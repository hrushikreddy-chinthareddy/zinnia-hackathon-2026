import { apiServerBaseUrl } from '@deps/queries/api-config';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import { GetHierarchyResponse } from '@deps/types/producers';
import { LoggingContext } from '@deps/utils/server-logging';

export const PRODUCERS_API_ORIGIN = 'producers-api';

export const getHierarchyBySellingCode = async (
    sellingCode: string,
    loggingContext: LoggingContext
): Promise<GetHierarchyResponse | undefined> => {
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

        return producersHierarchyResponseObject;
    } catch (error: any) {
        throwTypedError(error.message, PRODUCERS_API_ORIGIN);
    }
};
