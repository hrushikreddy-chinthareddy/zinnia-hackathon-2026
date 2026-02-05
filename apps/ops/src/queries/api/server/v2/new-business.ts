import { apiServerBaseUrl } from '@deps/queries/api-config';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import { NewBusiness, NewBusinessResponse } from '@deps/types/new-business';
import { LoggingContext } from '@deps/utils/server-logging';

export const NEW_BUSINESS_API_ORIGIN = 'new-business-api';

export const isNewBusinessErrorResponse = (
    obj: NewBusiness | NewBusinessResponse
): obj is NewBusinessResponse => 'message' in obj && obj.message != null;

export const getNewBusinessById = async (
    eAppId: string,
    loggingContext: LoggingContext
): Promise<NewBusiness | NewBusinessResponse> => {
    try {
        const newBusinessUrl = `${apiServerBaseUrl}/newbusiness/v2/application/${eAppId}`;
        const newBusinessResponse = await EnterpriseTokenApi.get(
            newBusinessUrl,
            {},
            loggingContext
        );
        const newBusinessResponseObject = await newBusinessResponse.json();

        return newBusinessResponseObject;
    } catch (error: any) {
        throwTypedError(error.message, NEW_BUSINESS_API_ORIGIN);
    }
};
