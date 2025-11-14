import {
    HTTPValidationError,
    TaskCountInput,
    TaskCountOutput,
} from '@xd/api-types/dist/generated-types/analytics';
import { AxiosResponse } from 'axios';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

export const getTaskCountData = async (
    query: TaskCountInput
): Promise<TaskCountOutput | HTTPValidationError> => {
    try {
        const { data: response } = await client.post<
            TaskCountInput,
            AxiosResponse<TaskCountOutput, HTTPValidationError>
        >(`${baseAppUrl}/api/dashboard/task-count`, query);

        return {
            data: response.data,
            totalElements: response.totalElements,
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
