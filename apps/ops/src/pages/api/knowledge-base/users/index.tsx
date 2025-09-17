import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import type { GetAllUserDetailsResponse } from '@deps/types/knowledge-base';
import { SortBy, SortDirection } from '@deps/types/knowledge-base';
import {
  logError,
  parseErrorInformation,
  withAuthAndLogging,
} from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

export default withAuthAndLogging(
  async (
    req: NextApiRequest,
    res: NextApiResponse<GetAllUserDetailsResponse | null>,
    loggingContext
  ) => {
    const accessToken = (await getAccessToken(req, res)).accessToken;

    const {
      page = '0',
      pageSize = '10',
      sortBy = SortBy.CreatedAt,
      sortDirection = SortDirection.Desc,
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSizeNumber = parseInt(pageSize as string, 10);
    const sortByField = sortBy as SortBy;
    const sortDir = sortDirection as SortDirection;

    const url = `${apiServerBaseUrl}/api/v1/users/all`;

    try {
      const { data } = await serverApi.get<
        any,
        AxiosResponse<GetAllUserDetailsResponse>
      >(
        url,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          params: {
            page: pageNumber,
            size: pageSizeNumber,
            sortBy: sortByField,
            sortDirection: sortDir,
          },
        },
        loggingContext
      );
      res.status(200).json(data);
    } catch (error: any) {
      logError('Error fetching user details', {
        ...parseErrorInformation(error),
        ...loggingContext,
      });
      res.status(error?.status ?? 500).json(error?.data ?? null);
    }
  },
  {
    file: 'knowledge-base/users/index',
    function: 'routeHandler',
  }
);