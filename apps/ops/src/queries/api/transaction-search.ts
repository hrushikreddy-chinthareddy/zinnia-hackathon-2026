import { AxiosResponse } from 'axios';

import { TransactionData } from '@deps/models/case/task/doc-matching-payment';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export interface SearchTransactionFilters {
    paymentRecordId: string;
}

export interface SearchTransactionPayload {
    identifiers: { identifier: string; value: string }[];
}

const transactionSearchUrl =
    apiServerBaseUrl + '/transactions/v1/transaction/search';

export const searchTransactionsByPaymentRecordId = async (
    filters: SearchTransactionFilters
): Promise<TransactionData[] | null> => {
    const loggingContext = {
        file: 'queries/api/transaction-search',
        function: 'searchTransactionsByPaymentRecordId',
        inputs: { filters },
    };

    try {
        const payload: SearchTransactionPayload = {
            identifiers: [
                {
                    identifier: 'paymentRecordId',
                    value: filters.paymentRecordId,
                },
            ],
        };

        const { data } = await client.post<
            any,
            AxiosResponse<TransactionData[]>
        >(transactionSearchUrl, payload);
        return data;
    } catch (e: any) {
        browserLogError('transactions::getTransactionsByCorrelationId::error', {
            ...parseErrorInformation(e),
            ...loggingContext,
        });
        return null;
    }
};
