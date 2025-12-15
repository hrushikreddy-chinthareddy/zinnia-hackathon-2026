import { AxiosResponse } from 'axios';

import {
    DefaultDataEntryTask,
    RequestType,
} from '@deps/models/case/default-case';
import { client } from '@deps/queries/api-utils/client';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl } from '../api-config';

const baseUrl = baseAppUrl + '/api/process/orkestr/v1/';

export const submitServiceRequestForm = async (
    requestBody: DefaultDataEntryTask,
    requestType: RequestType,
    loggingContext?: object
): Promise<any> => {
    try {
        browserLogInfo('SubmitServiceRequestForm', {
            ...loggingContext,
            payload: requestBody,
            url: `${baseUrl}/${requestType}`,
            function: 'process.submitServiceRequestForm',
        });
        const { data } = await client.post<
            DefaultDataEntryTask,
            AxiosResponse<any>
        >(`${baseUrl}/${requestType}`, requestBody);
        return data;
    } catch (e) {
        browserLogError('SubmitServiceRequestForm', {
            ...loggingContext,
            ...parseErrorInformation(e),
            payload: requestBody,
            url: `${baseUrl}/${requestType}`,
            function: 'process.submitServiceRequestForm',
        });

        return null;
    }
};
