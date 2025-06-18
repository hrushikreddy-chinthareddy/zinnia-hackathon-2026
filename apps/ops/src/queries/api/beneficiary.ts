import { AxiosResponse } from 'axios';
import { BeneficiaryRecord } from '@deps/models/case/task/beneficiary-record';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';
import { apiServerBaseUrl } from '@deps/queries/api-config';

export interface SearchTransactionFilters {
    zlCaseId: string;
    entityType: string;
}

export interface SearchTransactionPayload {
    identifiers: { identifier: string; value: string }[];
    entityType: string[];
}

const transactionSearchUrl = apiServerBaseUrl + '/transactions/v1/transaction/search';

export const searchBeneficiaryByCaseId = async (filters: SearchTransactionFilters): Promise<BeneficiaryRecord[] | null> => {
    const loggingContext = {
        file: 'queries/api/transaction-search',
        function: 'searchBeneficiaryByCaseId',
        inputs: { filters },
    };

    try {
        const payload: SearchTransactionPayload = {
            identifiers: [
                {
                    identifier: 'zlCaseId',
                    value: filters.zlCaseId,
                },
            ],
            entityType: [filters.entityType],
        };
        const { data } = await client.post<any, AxiosResponse<BeneficiaryRecord[]>>(transactionSearchUrl, payload);
        return data;
    } catch (e: any) {
        browserLogError('transactions::searchBeneficiaryByCaseId::error', {
            ...parseErrorInformation(e),
            ...loggingContext,
        });
        return null;
    }
};
