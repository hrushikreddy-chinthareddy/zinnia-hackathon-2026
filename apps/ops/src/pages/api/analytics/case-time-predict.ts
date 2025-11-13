import {
    CaseTimePredictOutput,
    HTTPValidationError,
} from '@xd/api-types/dist/generated-types/analytics';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<
            AxiosResponse<CaseTimePredictOutput> | HTTPValidationError
        >,
        loggingContext
    ) => {
        const url = `${apiServerBaseUrl}/analytics/v1/dashboard/case_time_predict`;
        return await requestHandler<CaseTimePredictOutput>(
            url as string,
            req,
            res,
            loggingContext
        );
    },
    { file: 'analytics/case-time-predict', function: 'routeHandler' }
);
