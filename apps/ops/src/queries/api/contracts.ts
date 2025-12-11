import { AxiosResponse } from 'axios';

import { createQueryString } from '@deps/helpers/string.helpers';
import { CallLogResponse } from '@deps/models/case/call-log';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

interface CaseCallLogsQuery {
    contract: string;
    carrier: string;
    limit?: number;
    offset?: number;
}

export const getCaseCallLogs = async (
    query: CaseCallLogsQuery
): Promise<{ data: CallLogResponse | null; status: number }> => {
    const { contract, carrier, limit, offset } = query;
    const queryParams = createQueryString({
        contract,
        clientCode: carrier,
        limit,
        offset,
    });

    browserLogInfo('getCaseCallLogs::fetching call logs', {
        ...query,
    });

    try {
        const { data, status } = await client.get<
            CallLogResponse,
            AxiosResponse
        >(`${baseAppUrl}/api/callcenter/v1/CallEntry?${queryParams}`);

        return { data, status };
    } catch (error: any) {
        browserLogError(
            'getCaseCallLogs::An error occurred while getting case call log results results',
            { ...parseErrorInformation(error), input: query }
        );

        return { data: null, status: (error as AxiosResponse)?.status || 500 };
    }
};
