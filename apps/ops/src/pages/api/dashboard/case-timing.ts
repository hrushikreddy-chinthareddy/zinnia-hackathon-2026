import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { ErrorResponse } from '@deps/types/api';
import { CaseTaskSearchResponse } from '@deps/types/search';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<AxiosResponse<CaseTaskSearchResponse> | ErrorResponse>) => {
        const url = `${apiServerBaseUrl}/analytics/v1/dashboard/completed_case_time`;
        return await requestHandler<CaseTaskSearchResponse>(url as string, req, res);
    },
    { file: 'dashboard/case-timing', function: 'routeHandler' }
);
