import {
    CompletedTaskTimeInput,
    CompletedTaskTimeOutput,
    HTTPValidationError,
} from '@xd/api-types/dist/generated-types/analytics';
import { AxiosResponse } from 'axios';

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
        console.error(
            'getTaskCountData::An error occurred while getting task count data',
            error
        );
        if ('detail' in error) {
            return error.response;
        }
        return error;
    }
};
