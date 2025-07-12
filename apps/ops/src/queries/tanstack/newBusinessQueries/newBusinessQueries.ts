import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import { NewBusiness } from '@deps/types/new-business';

export const getNewBusinessEApp = async (
    eAppId: string
): Promise<ApiResponse<NewBusiness>> => {
    try {
        const response = await client.get<NewBusiness>(
            `${baseAppUrl}/api/new-business/v2/application/${eAppId}`,
            {
                headers: { 'content-type': 'application/json' },
            }
        );

        return { data: response.data, error: null };
    } catch (error: any) {
        return error;
    }
};
