import { TransactionModelResponse } from '@zinnia/api-types/types/transaction-store';
import { AxiosResponse } from 'axios';

import { hasFilter } from '@deps/components/history/filters/filter.helpers';
import { getEvents } from '@deps/containers/subpages/activity-sub-page/event-feed/event-feed.helpers';
import { HistoryFilters } from '@deps/contexts/HistoryFiltersContext';
import { getPolicyTransactions } from '@deps/queries/api/policies';
import { baseAppUrl } from '@deps/queries/api-config';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { client } from '@deps/queries/api-utils/client';

interface GetTransactionsProps {
    historyFilters: Partial<HistoryFilters>;
    policyNumber?: string;
    planCode?: string;
    sortField?: 'PROCESSDATE' | 'EFFECTIVEDATE' | 'REVERSALDATE';
    sortOrder?: 'ASC' | 'DESC';
}

export const getTransactionsQuery = async ({
    historyFilters,
    policyNumber,
    planCode,
    sortField = 'EFFECTIVEDATE',
    sortOrder = 'DESC',
}: GetTransactionsProps) => {
    if (!policyNumber) {
        throw 'No policy number provided';
    }
    if (!planCode) {
        throw 'No plan code provided';
    }
    const { ...filters } = historyFilters;
    const transactionTypes = getEvents(filters.eventFilter);

    console.log({ filters });

    const results = await getPolicyTransactions({
        transactionTypes: transactionTypes,
        id: policyNumber,
        planCode: planCode,
        sortField,
        sortOrder,
        status: filters.statusFilter,
        ...(hasFilter(filters.yearFilter) && { year: filters.yearFilter }),
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
