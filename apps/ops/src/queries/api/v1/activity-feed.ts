import { AxiosResponse } from 'axios';

import { baseAppUrl } from '@deps/queries/api-config';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export const getActivityFeed = async (
    caseId: string,
    payload: any
): Promise<{ data: any | null; status: number }> => {
    browserLogInfo('getCaseActivityFeed::fetching activity feed', {
        caseId,
        payload,
    });

    try {
        const response = await client.post<any, AxiosResponse>(
            `${baseAppUrl}/api/case/v1/cases/${caseId}/activity-feed/search`,
            payload
        );

        return {
            data: response.data,
            status: response.status,
        };
    } catch (error: any) {
        browserLogError(
            'getCaseActivityFeed::An error occurred while getting case activity feed results',
            { ...parseErrorInformation(error), input: { caseId, ...payload } }
        );

        return { data: null, status: (error as AxiosResponse)?.status || 500 };
    }
};
