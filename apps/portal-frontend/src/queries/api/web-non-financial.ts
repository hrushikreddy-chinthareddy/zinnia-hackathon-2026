import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { logError, logInfo } from '@deps/utils/server-logging';

const baseUrl = `${baseAppUrl}/api/webnonfinancial/nonfinancial/v1`;

export const addTransaction = async (body: any): Promise<any> => {
    try {
        logInfo('Adding a transaction', {
            file: 'queries/webnonfinancial/nonfinancial/v1',
            function: 'putTransaction',
            url: `${baseUrl}/transactions`,
        });
        const {data} = await client.put<any, AxiosResponse>(
            `${baseUrl}/transactions`,
            body
        );
        logInfo('Added a transaction', {
            file: 'queries/webnonfinancial/nonfinancial/v1',
            function: 'putTransaction',
            url: `${baseUrl}/transactions`,
        });
        return data;
    } catch (error: any) {
        logError('An error occurred while adding  web non financial transaction', {
            file: 'queries/webnonfinancial/nonfinancial/v1',
            function: 'putTransaction',
        });
        return error;
    }
};
