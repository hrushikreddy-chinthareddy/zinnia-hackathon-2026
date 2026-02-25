import { AxiosResponse } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { withAuthAndLogging } from '@deps/utils/server-logging';
import {
    CompletedTaskTimeOutput,
    HttpValidationError,
} from '@zinnia/api-types/types/analytics';

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<
            AxiosResponse<CompletedTaskTimeOutput> | HttpValidationError
        >,
        loggingContext
    ) => {
        const url = `${apiServerBaseUrl}/analytics/v1/dashboard/completed_task_time`;
        return await requestHandler<CompletedTaskTimeOutput>(
            url as string,
            req,
            res,
            loggingContext
        );
    },
    { file: 'dashboard/completed-task-time', function: 'routeHandler' }
);
