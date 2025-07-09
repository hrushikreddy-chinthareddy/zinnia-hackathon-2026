import { AxiosResponse } from 'axios';

import { TransactionData } from '@deps/models/case/task/doc-matching-payment';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError } from '@deps/utils/browser-logging';
import {
    logError,
    LoggingContext,
    logInfo,
    parseErrorInformation,
} from '@deps/utils/server-logging';

import { serverApi } from '../api-utils/serverApiClient';

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

export const searchTransactionsSSR = async (
    payload: SearchTransactionPayload,
    accessToken: string | undefined,
    loggingContext: LoggingContext
): Promise<TransactionData[] | null> => {
    logInfo('transaction-search::searchTransactionsSSR::info', {
        ...loggingContext,
        payload,
    });
    const config = {
        authorization: `Bearer ${accessToken}`,
        headers: {
            'Content-type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    };

    try {
        const { data } = await serverApi.post<
            any,
            AxiosResponse<TransactionData[]>
        >(transactionSearchUrl, payload, config, loggingContext);
        return data;
    } catch (error: any) {
        logError('transaction-search::searchTransactionsSSR::error', {
            ...parseErrorInformation(error),
            ...loggingContext,
            payload,
        });
        return null;
    }
};
