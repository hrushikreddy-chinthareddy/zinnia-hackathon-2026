import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { CaseTaskSearchResponse } from '@deps/types/search';
import { withAuthAndLogging } from '@deps/utils/server-logging';

export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const url = `${apiServerBaseUrl}/analytics/v1/dashboard/completed_case_time`;
        return await requestHandler<CaseTaskSearchResponse>(url as string, req, res, loggingContext);
    },
    { file: 'dashboard/case-timing', function: 'routeHandler' }
);
