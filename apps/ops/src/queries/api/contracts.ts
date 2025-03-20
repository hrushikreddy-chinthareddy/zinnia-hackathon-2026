import { AxiosResponse } from 'axios';

import { CallLogResponse } from '@deps/models/case/call-log';
import { pullFromCache, writeToCache } from '@deps/utils/cache';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

interface CaseCallLogsQuery {
    contract: string;
    limit?: number;
    offset?: number;
}

export const getCaseCallLogs = async (query: CaseCallLogsQuery): Promise<{ data: CallLogResponse | null; status: number }> => {
    const { contract, limit, offset } = query;
    const queryParams = `?contract=${contract}&limit=${limit}&offset=${offset}`;

    try {
        const cachedResult = pullFromCache('getCallLogs', query);

        if (cachedResult) {
            return cachedResult;
        }

        const { data, status } = await client.get<CallLogResponse, AxiosResponse>(
            `${baseAppUrl}/api/callcenter/v1/CallEntry${queryParams}`
        );

        writeToCache('getCallLogs', query, { data, status }, 0.5); // These could change frequently, so only cache for 30 seconds for navigating between pages

        return { data, status };
    } catch (error: any) {
        console.error('getCaseCallLogs::An error occurred while getting case call log results results', error);

        return { data: null, status: (error as AxiosResponse)?.status || 500 };
    }
};
