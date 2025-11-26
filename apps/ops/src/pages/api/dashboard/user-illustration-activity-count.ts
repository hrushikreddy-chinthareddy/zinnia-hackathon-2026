import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { withAuthAndLogging } from '@deps/utils/server-logging';
import {
    UserIllustrationActivityOutput,
    HTTPValidationError,
} from '@zinnia/api-types/types/analytics';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<
            AxiosResponse<UserIllustrationActivityOutput> | HTTPValidationError
        >,
        loggingContext
    ) => {
        const url = `${apiServerBaseUrl}/analytics/v1/dashboard/user_illustration_activity_count`;
        return await requestHandler<UserIllustrationActivityOutput>(
            url as string,
            req,
            res,
            loggingContext
        );
    },
    {
        file: 'dashboard/user-illustration-activity-count',
        function: 'routeHandler',
    }
);
