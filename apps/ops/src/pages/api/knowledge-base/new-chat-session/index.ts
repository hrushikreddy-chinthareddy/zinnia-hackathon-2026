import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import {
  logCompliance,
  logError,
  parseErrorInformation,
  withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
  async (
    req: NextApiRequest,
    res: NextApiResponse<any | null>,
    loggingContext
  ) => {
    const accessToken = (await getAccessToken(req, res)).accessToken;
    const { email, clientId, sessionTitle } = req.body;

    if (!email || !clientId) {
      logError(
        'Error creating new chat session:: missing email or clientId',
        loggingContext
      );
      return res.status(400).json({ error: 'missing email or clientId' });
    }

    const url = `${apiServerBaseUrl}/api/v1/chat/sessions`;

    try {
      logCompliance(
        `Creating new chat session for client: ${clientId}`,
        loggingContext
      );

      const { data, status } = await serverApi.post<any, AxiosResponse>(
        url,
        {
          email,
          clientId,
          ...(sessionTitle ? { sessionTitle } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
        loggingContext
      );

      res.status(status).json(data);
    } catch (error: any) {
      logError('Error creating chat session', {
        ...parseErrorInformation(error),
        ...loggingContext,
      });
      res.status(error?.status ?? 500).json(error?.data ?? null);
    }
  },
  {
    file: 'knowledge-base/new-chat-session/index',
    function: 'routeHandler',
  }
);