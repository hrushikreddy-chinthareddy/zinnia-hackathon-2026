import { se2ApiServerUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { CaseTaskSearchResponse } from '@deps/types/search';
import { withAuthAndLogging } from '@deps/utils/server-logging';

export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const re = new RegExp('^.*?/api');
        const proxyUrl = req.url?.replace(re, se2ApiServerUrl as string);

        return await requestHandler<CaseTaskSearchResponse>(proxyUrl as string, req, res, loggingContext);
    },
    { file: 'tasks/search', function: 'routeHandler' }
);
