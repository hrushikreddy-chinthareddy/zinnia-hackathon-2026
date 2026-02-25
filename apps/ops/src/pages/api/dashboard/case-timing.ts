import { AxiosResponse } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { withAuthAndLogging } from '@deps/utils/server-logging';
import {
    CompletedCaseTimeOutput,
    HttpValidationError,
} from '@zinnia/api-types/types/analytics';

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<
            AxiosResponse<CompletedCaseTimeOutput> | HttpValidationError
        >,
        loggingContext
    ) => {
        const url = `${apiServerBaseUrl}/analytics/v1/dashboard/completed_case_time`;
        return await requestHandler<CompletedCaseTimeOutput>(
            url as string,
            req,
            res,
            loggingContext
        );
    },
    { file: 'dashboard/case-timing', function: 'routeHandler' }
);
