import { AxiosResponse } from 'axios';

import {
    CalculateRmdBody,
    CalculateRmdResponse,
} from '@deps/models/case/withdrawal/rmd';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';
const baseUrl = baseAppUrl + '/api/rmd-calculation/v1';

export const calculateRmd = async (
    query: CalculateRmdBody
): Promise<CalculateRmdResponse> => {
    try {
        const response = await client.post<CalculateRmdBody, AxiosResponse>(
            `${baseUrl}/rmd`,
            query
        );
        return response.data;
    } catch (error: any) {
        console.error(
            'calculate RMD::An error occurred retrieving calculate RMD response',
            error
        );
        throw new Error(
            error?.data?.status?.statusMessage ||
                'An error occurred retrieving calculate RMD response'
        );
    }
};
