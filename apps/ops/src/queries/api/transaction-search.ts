import { AxiosResponse } from 'axios';

import { BeneficiaryRecord } from '@deps/models/case/task/beneficiary-record';
import { TransactionData } from '@deps/models/case/task/doc-matching-payment';
import { apiServerBaseUrl } from '@deps/queries/api-config';
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
    entityType?: string[];
}

const transactionSearchUrl =
    apiServerBaseUrl + '/transactions/v1/transaction/search';

export const searchTransactionsSSR = async (
    payload: SearchTransactionPayload,
    accessToken: string | undefined,
    loggingContext: LoggingContext
): Promise<TransactionData[] | BeneficiaryRecord[] | null> => {
    logInfo('transaction-search::searchTransactionsSSR::info', {
        ...loggingContext,
        payload,
    });

    if (Object.keys(payload).length === 0) {
        logInfo('transaction-search::searchTransactionsSSR::info', {
            ...loggingContext,
            message: 'Empty payload received',
        });
        return [];
    }
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
