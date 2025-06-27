import { AxiosResponse } from 'axios';

import { NotificationsTransactionData } from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab.types';
import { TransactionData } from '@deps/models/case/task/doc-matching-payment';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl } from '../api-config';

const baseUrl = baseAppUrl + '/api/transactions/v1/';

export const getTransactionsByCorrelationId = async (
    correlationId: string,
    optionalParams: {
        entityType?: string;
        createdTs?: string;
        updatedTs?: string;
    } = {}
): Promise<TransactionData[] | null> => {
    let url = `${baseUrl}/transaction/${correlationId}/entities?`;

    if (Object.keys(optionalParams).length > 0) {
        url =
            url +
            Object.keys(optionalParams)
                .map(
                    (key) =>
                        `${key}=${
                            optionalParams[key as keyof typeof optionalParams]
                        }`
                )
                .join('&');
    }

    try {
        const { data } = await client.get<
            any,
            AxiosResponse<TransactionData[]>
        >(url);

        return data;
    } catch (e: any) {
        browserLogError('transactions::getTransactionsByCorrelationId::error', {
            ...parseErrorInformation(e),
            correlationId,
        });
        return null;
    }
};

export const getTransactionsByRecordId = async (
    recordId: string
): Promise<NotificationsTransactionData | null> => {
    const url = `${baseUrl}/transaction/entities/${recordId}`;

    try {
        const { data } = await client.get<
            any,
            AxiosResponse<NotificationsTransactionData>
        >(url);
        browserLogInfo('transactions::getTransactionsByRecordId::success', {
            recordId,
        });
        return data;
    } catch (e: any) {
        browserLogError('transactions::getTransactionsByRecordId::error', {
            ...parseErrorInformation(e),
            recordId,
        });
        return null;
    }
};
