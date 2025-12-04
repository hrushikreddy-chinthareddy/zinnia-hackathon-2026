import { AxiosResponse } from 'axios';

import { browserLogError } from '@deps/utils/browser-logging';
import {
    CompletedTaskTimeInput,
    CompletedTaskTimeOutput,
    HTTPValidationError,
} from '@zinnia/api-types/types/analytics';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

export const getCompletedTaskTimeData = async (
    query: CompletedTaskTimeInput
): Promise<CompletedTaskTimeOutput | HTTPValidationError> => {
    try {
        const { data: response } = await client.post<
            CompletedTaskTimeInput,
            AxiosResponse<CompletedTaskTimeOutput, HTTPValidationError>
        >(`${baseAppUrl}/api/dashboard/completed-task-time`, query);

        return {
            data: response.data,
        };
    } catch (error: any) {
        browserLogError(
            'getCompletedTaskTimeData::An error occurred while getting completed task time',
            error
        );

        return error;
    }
};
