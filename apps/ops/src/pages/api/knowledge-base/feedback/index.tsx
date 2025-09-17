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
    const { email, messageId, feedbackType, comment = '' } = req.body;

    if (!email || !messageId || !feedbackType) {
      logError(
        'Error searching chat sessions:: missing email, messageId or feedbackType',
        loggingContext
      );
      return res.status(400).json({ error: 'missing email, messageId or feedbackType' });
    }

    const url = `${apiServerBaseUrl}/api/v1/chat/messages/${messageId}/feedback`;

    try {
      logCompliance(
        `Submitting Feedback for messageId: ${messageId}`,
        loggingContext
      );

      const { data, status } = await serverApi.post<any, AxiosResponse>(
        url,
        {
          email,
          feedbackType,
          comment
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
      logError('Error sending feedback', {
        ...parseErrorInformation(error),
        ...loggingContext,
      });
      res.status(error?.status ?? 500).json(error?.data ?? null);
    }
  },
  {
    file: 'knowledge-base/feedback/index',
    function: 'routeHandler',
  }
);