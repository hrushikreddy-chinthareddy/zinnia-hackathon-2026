import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import type { ClientDetailsResponse } from '@deps/types/knowledge-base';
import {
  logError,
  parseErrorInformation,
  withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';


export default withAuthAndLogging(
  async (
    req: NextApiRequest,
    res: NextApiResponse<ClientDetailsResponse | null>,
    loggingContext
  ) => {
    const accessToken = (await getAccessToken(req, res)).accessToken;
    const url = `${apiServerBaseUrl}/api/v1/clients`;

    try {
      const { data } = await serverApi.get<
        any,
        AxiosResponse<ClientDetailsResponse>
      >(
        url,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
        loggingContext
      );
      res.status(200).json(data);
    } catch (error: any) {
      logError('Error fetching client details', {
        ...parseErrorInformation(error),
        ...loggingContext,
      });
      res.status(error?.status ?? 500).json(error?.data ?? null);
    }
  },
  {
    file: 'knowledge-base/clients/index',
    function: 'routeHandler',
  }
);