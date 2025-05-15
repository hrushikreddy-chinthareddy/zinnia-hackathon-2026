import { AxiosResponse } from 'axios';

import { CallLogResponse } from '@deps/models/case/call-log';

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
        const { data, status } = await client.get<CallLogResponse, AxiosResponse>(
            `${baseAppUrl}/api/callcenter/v1/CallEntry${queryParams}`
        );

        return { data, status };
    } catch (error: any) {
        console.error('getCaseCallLogs::An error occurred while getting case call log results results', error);

        return { data: null, status: (error as AxiosResponse)?.status || 500 };
    }
};
