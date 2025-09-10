import { apiServerBaseUrl } from '@deps/queries/api-config';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import {
    logError,
    parseErrorInformation,
    withAuthAndLogging,
} from '@deps/utils/server-logging';

// Will proxy any request made to the next server directly to the gateway apis
export default withAuthAndLogging(
    async (req, res, loggingContext) => {
        const re = new RegExp('^.*?/api');
        const proxyUrl = req.url?.replace(re, apiServerBaseUrl as string);

        let response;
        try {
            if (req.method === 'PUT')
                response = await EnterpriseTokenApi.put(
                    proxyUrl as string,
                    JSON.stringify(req.body),
                    {
                        headers: { 'Content-Type': 'application/json' },
                    },
                    loggingContext
                );
            if (req.method === 'GET')
                response = await EnterpriseTokenApi.get(
                    proxyUrl as string,
                    {},
                    loggingContext
                );
            if (req.method === 'POST')
                response = await EnterpriseTokenApi.post(
                    proxyUrl as string,
                    JSON.stringify(req.body),
                    {
                        headers: { 'Content-Type': 'application/json' },
                    },
                    loggingContext
                );
            if (req.method === 'PATCH')
                response = await EnterpriseTokenApi.patch(
                    proxyUrl as string,
                    JSON.stringify(req.body),
                    {
                        headers: { 'Content-Type': 'application/json' },
                    },
                    loggingContext
                );
        } catch (err) {
            logError(`server::requestHandler::error`, {
                ...parseErrorInformation(err),
                ...loggingContext,
                proxyUrl,
            });
            res.status(500).json({ err });
        }

        if (response === undefined) {
            return res.status(500).json({ err: 'No response' });
        }
        const jsonResponse = await response.json();

        return res.json(jsonResponse);
    },
    { file: 'illustration reverse-proxy (slug)', function: 'routeHandler' }
);
