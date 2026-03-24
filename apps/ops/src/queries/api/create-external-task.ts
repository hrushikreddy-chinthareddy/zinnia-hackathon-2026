import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';

export const createExternalTask = async (payload: any) => {
    const url = `${baseAppUrl}/api/process/v1/externaltask/start`;

    browserLogInfo(
        'v1/externaltask/start:createExternalTask:: Submitting external Task',
        {
            file: 'queries/api/create-external-task',
            function: 'createExternalTask',
            url,
            payload,
        }
    );

    try {
        const data = await client.post(url, payload);
        return data;
    } catch (error: any) {
        browserLogError(
            'v1/externaltask/start:createExternalTask::Something went wrong while starting an external task',
            {
                ...parseErrorInformation(error),
                file: 'queries/api/create-external-task',
                function: 'createExternalTask',
                url,
                payload,
            }
        );
        return error;
    }
};
