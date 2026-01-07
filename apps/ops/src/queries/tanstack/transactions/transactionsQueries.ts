import { AxiosResponse } from 'axios';

import { hasFilter } from '@deps/components/history/filters/filter.helpers';
import { getEvents } from '@deps/containers/subpages/activity-sub-page/event-feed/event-feed.helpers';
import {
    getPolicyTransactions,
    getPolicyTransactionsSummary,
} from '@deps/queries/api/policies';
import { baseAppUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';
import { Transaction } from '@zinnia/api-types/types/sor';
import { TransactionModelResponse } from '@zinnia/api-types/types/transaction-store';

import { GetTransactionsProps, GetTransactionsSummaryProps } from './types';

export const getTransactionsSummaryQuery = async ({
    policyNumber,
    planCode,
    sortField = 'EFFECTIVEDATE',
    sortOrder = 'DESC',
    ...args
}: GetTransactionsSummaryProps) => {
    if (!policyNumber) {
        throw 'No policy number provided';
    }
    if (!planCode) {
        throw 'No plan code provided';
    }

    return await getPolicyTransactionsSummary({
        policyNumber,
        planCode: planCode,
        sortField,
        sortOrder,
        ...args,
    });
};

export const getTransactionByIdQuery = async ({
    policyNumber,
    planCode,
    transactionId,
}: {
    policyNumber?: string;
    planCode?: string;
    transactionId?: string;
}) => {
    {
        if (!transactionId) {
            throw new Error('No transaction id provided');
        }
        if (!policyNumber || !planCode) {
            throw new Error('No policy number or plan code provided');
        }
        const val = await client.get<
            { data: Transaction },
            AxiosResponse<{ data: Transaction }>
        >(
            `${baseAppUrl}/api/policy/v1/policies/${planCode}/${policyNumber}/transactions/${transactionId}`
        );

        return val.data;
    }
};

export const getTransactionsQuery = async ({
    historyFilters,
    policyNumber,
    planCode,
    sortField = 'EFFECTIVEDATE',
    sortOrder = 'DESC',
    multiTransactionTypes,
}: GetTransactionsProps) => {
    if (!policyNumber) {
        throw 'No policy number provided';
    }
    if (!planCode) {
        throw 'No plan code provided';
    }

    const { eventFilter, yearFilter, statusFilter, datesFilter } =
        historyFilters;

    const transactionTypes = getEvents(eventFilter, multiTransactionTypes);

    const results = await getPolicyTransactions({
        transactionTypes: transactionTypes,
        id: policyNumber,
        planCode: planCode,
        sortField,
        sortOrder,
        status: statusFilter,
        ...(hasFilter(yearFilter) && { year: yearFilter }),
        ...(hasFilter(datesFilter) && {
            from: historyFilters.datesFilter?.from,
            to: historyFilters.datesFilter?.to,
        }),
    });

    return results;
};

export const getTransactionEntityQuery = async (paymentRecordId?: string) => {
    if (!paymentRecordId) {
        throw 'No transaction id provided';
    }
    const response = await client.get<TransactionModelResponse, AxiosResponse>(
        `${baseAppUrl}/api/transactions/v1/transaction/entities/${paymentRecordId}`
    );

    if (response.status === StatusCode.Okay) {
        return response.data;
    }

    throw `Error getting payment record ${paymentRecordId}: ${response.status} ${response.statusText}`;
};
