import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { withAuthAndLogging } from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const re = new RegExp('^.*?/api');
        const proxyUrl = req.url?.replace(re, apiServerBaseUrl as string);

        return await requestHandler<any>(
            proxyUrl as string,
            req,
            res,
            loggingContext
        );
    },
    { file: 'reverse-proxy (slug)', function: 'routeHandler' }
);
