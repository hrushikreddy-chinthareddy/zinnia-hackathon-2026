import { datadogLogs } from '@datadog/browser-logs';
import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';

const baseUrl = `${baseAppUrl}/api/webnonfinancial/nonfinancial/v1`;

export const addTransaction = async (body: any): Promise<any> => {
    try {
        datadogLogs.logger.info('webNonFinancial', {
            message: 'Adding a transaction',
            payload: body,
            url: `${baseUrl}/transactions`,
            function: 'web-non-financial.addTransaction',
        });
        const {data} = await client.put<any, AxiosResponse>(
            `${baseUrl}/transactions`,
            body
        );
        datadogLogs.logger.info('webNonFinancial', {
            message: 'Added a transaction',
            payload: body,
            url: `${baseUrl}/transactions`,
            function: 'web-non-financial.addTransaction',
        });
        return data;
    } catch (error: any) {
        datadogLogs.logger.error('webNonFinancial', {
            payload: body,
            message: 'Failed to add transaction',
            error,
            url: `${baseUrl}/transactions`,
            function: 'web-non-financial.addTransaction',
        });
        return error;
    }
};
