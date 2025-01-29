import { AxiosResponse } from 'axios';

import { TransactionData } from '@deps/models/case/task/doc-matching-payment';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl } from '../api-config';

const baseUrl = baseAppUrl + '/api/transactions/v1/';

export const getTransactionsByCorrelationId = async (
    correlationId: string,
    optionalParams: { entityType?: string; createdTs?: string; updatedTs?: string } = {}
): Promise<TransactionData[] | null> => {
    let url = `${baseUrl}/transaction/${correlationId}/entities?`;

    if (Object.keys(optionalParams).length > 0) {
        url =
            url +
            Object.keys(optionalParams)
                .map(key => `${key}=${optionalParams[key as keyof typeof optionalParams]}`)
                .join('&');
    }

    try {
        const { data } = await client.get<any, AxiosResponse<TransactionData[]>>(url);

        return data;
    } catch (e: any) {
        browserLogError('transactions::getTransactionsByCorrelationId::error', { ...parseErrorInformation(e), correlationId });
        return null;
    }
};
