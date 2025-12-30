import { AxiosResponse } from 'axios';

import { browserLogError } from '@deps/utils/browser-logging';
import {
    TaskCountInput,
    TaskCountOutput,
} from '@zinnia/api-types/types/analytics';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

export const getTaskCountData = async (
    query: TaskCountInput
): Promise<TaskCountOutput> => {
    try {
        const { data: response } = await client.post<
            TaskCountInput,
            AxiosResponse<TaskCountOutput>
        >(`${baseAppUrl}/api/dashboard/task-count`, query);

        return {
            data: response.data,
            totalElements: response.totalElements,
        };
    } catch (error: any) {
        browserLogError(
            'getTaskCountData::An error occurred while getting task count data',
            error
        );

        throw error;
    }
};
