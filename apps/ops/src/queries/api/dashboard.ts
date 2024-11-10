import { AxiosResponse } from 'axios';

import { sortAlphabetically } from '@deps/helpers/dashboard/dashboard-helpers';
import { logError, logInfo, parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl, se2ApiServerUrl } from '../api-config';
import { client } from '../api-utils/client';
import { serverApi } from '../api-utils/serverApiClient';

export type BrokerDealerRequestBody = {
  filter: {
    createdDateStart: string;
  };
  groupBy: string[];
}

export type BrokerDealerAPIResponse = {
  data: BrokerDealerResponse[];
  totalElements: number;
};
export type BrokerDealerResponse = {
  key: string;
  name: string;
  count: number;
};

export const defaultBrokerDealerBody: BrokerDealerRequestBody = {
  filter: {
    createdDateStart: new Date(`01/01/${new Date().getFullYear()}`).toISOString(),
  },
  groupBy: ['brokerDealerName'],
}
const baseDashboardUrl = `${baseAppUrl}/api/case/v1/dashboard`;
const baseDashboardUrlSSR = `${se2ApiServerUrl}/dashboard`;


export const fetchAgents = async (body = defaultBrokerDealerBody): Promise<BrokerDealerResponse[]> => {
  const url = new URL(`${baseDashboardUrl}/stats`);
  try {
    const { data } = await client.post<BrokerDealerRequestBody, AxiosResponse<BrokerDealerAPIResponse>>(url.toString(), body);
    data.data.sort((a, b) => sortAlphabetically(a.name, b.name));
    return data.data;
  } catch (error: any) {
    logError('fetchAgents', {
      ...parseErrorInformation(error),
      file: 'queries/api/dashboard',
      function: 'fetchAgents',
    });
    return [];
  }
}


export const getBrokerDealerAgentsSSR = async (accessToken: string, body = defaultBrokerDealerBody): Promise<BrokerDealerResponse[]> => {
  const url = new URL(`${baseDashboardUrlSSR}/stats`);
  try {
    logInfo('getBrokerDealerAgentsSSR', { file: 'queries/api/dashboard', function: 'getBrokerDealerAgentsSSR', url: baseDashboardUrlSSR });
    const { data } = await serverApi.post<BrokerDealerRequestBody, AxiosResponse<BrokerDealerAPIResponse>>(url.toString(), body, {
      authorization: `Bearer ${accessToken}`,
      headers: {
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });

    return data.data.sort((a, b) => sortAlphabetically(a.name, b.name));
  } catch (error: any) {
    logError('getBrokerDealerAgentsSSR', {
      ...parseErrorInformation(error),
      file: 'queries/api/dashboard',
      function: 'getBrokerDealerAgentsSSR',
    });
    return [];
  }
}
