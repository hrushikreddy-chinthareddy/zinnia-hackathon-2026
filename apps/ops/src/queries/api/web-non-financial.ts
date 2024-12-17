import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

const baseUrl = `${baseAppUrl}/api/webnonfinancial/nonfinancial/v1`;

export const addTransaction = async (body: any): Promise<any> => {
    const { businessKey, correlationid, carrierId, policyNumber, }  = body || {};

    try {
        browserLogInfo('webNonFinancial', {
            message: 'Adding a transaction',
            payload: { businessKey, correlationid, carrierId, policyNumber },
            url: `${baseUrl}/transactions`,
            function: 'web-non-financial.addTransaction',
        });
        const {data} = await client.put<any, AxiosResponse>(
            `${baseUrl}/transactions`,
            body
        );
        browserLogInfo('webNonFinancial', {
            message: 'Added a transaction',
            payload: { businessKey, correlationid, carrierId, policyNumber },
            url: `${baseUrl}/transactions`,
            function: 'web-non-financial.addTransaction',
        });
        return data;
    } catch (error: any) {
        browserLogError('webNonFinancial', {
            ...parseErrorInformation(error),
            message: 'Failed to add transaction',
            payload: { businessKey, correlationid, carrierId, policyNumber },
            url: `${baseUrl}/transactions`,
            function: 'web-non-financial.addTransaction',
        });
        return error;
    }
};
