import { AxiosResponse } from 'axios';

import { client } from '@deps/queries/api-utils/client';

import { baseAppUrl } from '../api-config';

export const getAgentData = async ({ clientCode, id }: any): Promise<any | undefined> => {
    try {
        const url = `${baseAppUrl}/api/api/${clientCode}/salesentity?idType=external&skip=0&limit=10&id=${id}`;
        const response = await client.get<any, AxiosResponse>(url);

        console.log(response.data);
        // if (response.data.hasError) {
        //     throw new Error(response.data.errorMessage);
        // } else {}
        return response.data;
    } catch (error: any) {
        console.error('An error occurred while requesting transactions', error);
    }
};
