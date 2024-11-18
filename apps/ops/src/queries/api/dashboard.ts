import { AxiosResponse } from 'axios';

import { sortAlphabetically } from '@deps/helpers/dashboard/dashboard-helpers';
import { logError, logInfo, parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl, se2ApiServerUrl } from '../api-config';
import { client } from '../api-utils/client';
import { AxiosAuthRequestConfig, serverApi } from '../api-utils/serverApiClient';

export type BrokerDealerRequestBody = {
  filter: {
    createdDateStart: string;
    caseStatus?: string[];
  };
  groupBy: string[];
  process?: string[];
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


export const getBrokerDealerAgentsSSR = async (accessToken: string, body = defaultBrokerDealerBody, config?: AxiosAuthRequestConfig): Promise<BrokerDealerResponse[]> => {
  const url = new URL(`${baseDashboardUrlSSR}/stats`);
  try {
    logInfo('getBrokerDealerAgentsSSR', { file: 'queries/api/dashboard', function: 'getBrokerDealerAgentsSSR', url: baseDashboardUrlSSR });
    const { data } = await serverApi.post<BrokerDealerRequestBody, AxiosResponse<BrokerDealerAPIResponse>>(url.toString(), body, {
      ...config,
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

export const completedCasesByProcessSubTypeSSR = async (accessToken: string, config?: AxiosAuthRequestConfig): Promise<BrokerDealerAPIResponse> => {
  const url = new URL(`${baseDashboardUrlSSR}/stats`);
  try {
    logInfo('completedCasesByProcessSubType', { file: 'queries/api/dashboard', function: 'completedCasesByProcessSubType', url: baseDashboardUrlSSR });
    const { data } = await serverApi.post<BrokerDealerRequestBody, AxiosResponse<BrokerDealerAPIResponse>>(url.toString(), {
      filter: {
        createdDateStart: new Date(`01/01/${new Date().getFullYear()}`).toISOString(),
        caseStatus: ['COMPLETED'],
      },
      process: ['New Business'],
      groupBy: ['processSubType'],
    }, {
      ...config,
      authorization: `Bearer ${accessToken}`,
      headers: {
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
    return data;
  } catch (error: any) {
    logError('completedCasesByProcessSubType', {
      ...parseErrorInformation(error),
      file: 'queries/api/dashboard',
      function: 'completedCasesByProcessSubTypeSSR',
    });
    return {
      data: [],
      totalElements: 0,
    };
  }
}

export const completedCasesByProcessSubType = async (config?: AxiosAuthRequestConfig): Promise<BrokerDealerAPIResponse> => {
  const url = new URL(`${baseDashboardUrl}/stats`);
  try {
    const { data } = await client.post<BrokerDealerRequestBody, AxiosResponse<BrokerDealerAPIResponse>>(url.toString(), {
      filter: {
        createdDateStart: new Date(`01/01/${new Date().getFullYear()}`).toISOString(),
        caseStatus: ['COMPLETED'],
      },
      process: ['New Business'],
      groupBy: ['processSubType'],
    }, config);
    return data;
  } catch (error: any) {
    logError('completedCasesByProcessSubType', {
      ...parseErrorInformation(error),
      file: 'queries/api/dashboard',
      function: 'completedCasesByProcessSubType',
    });
    return {
      data: [],
      totalElements: 0,
    };
  }
}

/**
 * curl --location 'https://api.zinnia.io//case/v1/dashboard/stats' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'Authorization: ••••••' \
--data '{
    "filter":{
        "createdDateStart":"2023-11-13T00:00:00-06:00",
        "process": ["New Business"],
        "caseStatus": ["COMPLETED"]
    },
    "groupBy": ["processSubType"]
}'
 */