import {
    HTTPValidationError,
    UserTransactionOutput,
} from '@zinnia/api-types/types/analytics';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (
        req: NextApiRequest,
        res: NextApiResponse<
            AxiosResponse<UserTransactionOutput> | HTTPValidationError
        >,
        loggingContext
    ) => {
        const url = `${apiServerBaseUrl}/analytics/v1/dashboard/user_transaction_count`;
        return await requestHandler<UserTransactionOutput>(
            url as string,
            req,
            res,
            loggingContext
        );
    },
    { file: 'dashboard/user-transaction-count', function: 'routeHandler' }
);
