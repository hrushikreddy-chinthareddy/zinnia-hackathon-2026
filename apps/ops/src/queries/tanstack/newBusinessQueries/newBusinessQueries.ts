import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { ApiResponse } from '@deps/types/api-response';
import { NewBusiness, NewBusinessResponse } from '@deps/types/new-business';

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

export const patchNewBusinessEApp = async (
    eAppId: string,
    illustrationId: string,
    caseId: string
): Promise<ApiResponse<NewBusinessResponse>> => {
    try {
        const newBusinessUpdateNode = {
            caseId,
            illustrations: {
                source: 'ZINNIA',
                illustrationId,
            },
        };
        const response = await client.patch<
            Partial<NewBusiness>,
            AxiosResponse<NewBusinessResponse>
        >(
            `${baseAppUrl}/api/new-business/v2/application/${eAppId}`,
            newBusinessUpdateNode
        );
        return { data: response.data, error: null };
    } catch (error: any) {
        return error;
    }
};
