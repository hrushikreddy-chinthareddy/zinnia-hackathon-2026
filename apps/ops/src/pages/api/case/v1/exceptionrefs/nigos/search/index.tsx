import { getAccessToken } from '@auth0/nextjs-auth0';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { logTrace, logWarn, parseErrorInformation, withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

type error = {
  error: string;
};

export default withAuthAndLogging(
  async (req: NextApiRequest, res: NextApiResponse<any | null | error>, logCtx) => {
    const now = performance.now();
    const method = req.method;
    const accessToken = (await getAccessToken(req, res)).accessToken;
    const baseUrl = `${apiServerBaseUrl}/case/v1/exceptionrefs/nigos/search`;

    const loggingContext = { ...logCtx, baseUrl };
    logTrace(`assignments::${method}::start`, loggingContext);

    const config = {
      authorization: `Bearer ${accessToken}`,
      headers: {
        'Content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };

    try {
      let response;
      if (method === 'POST') {
        const body = {
          category: ["NB suitability"],
          businessProcess: "New Business"
        };
        response = await serverApi.post(baseUrl, body, config, loggingContext);
      } else {
        return res.status(405).json({ error: `Method ${method} not allowed` });
      }

      logTrace(`serverApiClient::${method}::success`, {
        ...loggingContext,
        duration: performance.now() - now,
      });

      return res.status(200).json(response.data);
    } catch (error) {
      logWarn(`serverApiClient::${method}::error`, {
        ...parseErrorInformation(error),
        ...loggingContext,
        duration: performance.now() - now,
      });
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  { file: 'case/v1/exceptionrefs/nigos/search', function: 'routeHandler' }
);
