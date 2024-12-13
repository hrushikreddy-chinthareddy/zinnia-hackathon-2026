import { AxiosRequestConfig, AxiosResponse } from 'axios';

import { oneYearAgoISO, sortAlphabetically } from '@deps/helpers/dashboard/dashboard-helpers';
import { logError, parseErrorInformation } from '@deps/utils/server-logging';

import { baseAppUrl, se2ApiServerUrl } from '../api-config';
import { client } from '../api-utils/client';
import { AxiosAuthRequestConfig, serverApi } from '../api-utils/serverApiClient';


export type DashboardRequestFilters = {
  createdDateStart?: string;
  process?: string[];
  processSubType?: string[];
  caseStatus?: string[];
}

export type DashboardRequestBody = {
  filter?: DashboardRequestFilters;
  groupBy?: string[];
}

export type DashboardResponseData = {
  key: string;
  name: string;
  count: number;
  values?: DashboardResponseData[]
}

export type DashboardRequestAPIResponse = {
  data: DashboardResponseData[];
  totalElements: number;
}

// const baseDashboardUrl = `${baseAppUrl}/api/case/v1/dashboard`;
const baseDashboardUrlSSR = `${se2ApiServerUrl}/dashboard`;


export const fetchDashboardStats = async (body: DashboardRequestBody, fnName = 'fetchDashboardStats', config?: AxiosRequestConfig): Promise<DashboardRequestAPIResponse> => {
  const url = (`${baseAppUrl}/api/case/v1/dashboard/stats`);
  try {
    const { data } = await client.post<DashboardRequestBody, AxiosResponse<DashboardRequestAPIResponse>>(url, body, config);
    if (Array.isArray(data?.data) && data?.data?.length > 0) {
      return data;
    }

    return { data: [], totalElements: 0 };
  } catch (error: any) {
    logError('fetchDashboardStats', {
      ...parseErrorInformation(error),
      file: 'queries/api/dashboard',
      function: fnName,
    });
    return { data: [], totalElements: 0 };
  }
}

export const fetchDashboardStatsSSR = async (accessToken: string, body: DashboardRequestBody, fnName = 'fetchDashboardStatsSSR', config?: AxiosAuthRequestConfig): Promise<DashboardRequestAPIResponse> => {
  const url = new URL(`${baseDashboardUrlSSR}/stats`);
  try {
    const { data } = await serverApi.post<DashboardRequestBody, AxiosResponse<DashboardRequestAPIResponse>>(url.toString(), body, {
      ...config,
      authorization: `Bearer ${accessToken}`,
      headers: {
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Access-Control-Allow-Origin': '*',
        Connection: 'keep-alive',
      },
    });
    if (Array.isArray(data?.data) && data?.data?.length > 0) {
      return data;
    }

    return { data: [], totalElements: 0 };
  } catch (error: any) {
    logError('fetchDashboardStatsSSR', {
      ...parseErrorInformation(error),
      file: 'queries/api/dashboard',
      function: fnName,
    });
    return { data: [], totalElements: 0 };
  }
}
export const brokerDealerBody: DashboardRequestBody = {
  filter: {
    createdDateStart: oneYearAgoISO,
  },
  groupBy: ['brokerDealerName'],
}


export const fetchAgents = async (body = brokerDealerBody, config?: AxiosRequestConfig): Promise<DashboardResponseData[]> =>
  fetchDashboardStats(body, 'fetchAgents', config).then((data) => data.data.sort((a, b) => sortAlphabetically(a.name, b.name)));

export const fetchAgentsSSR = async (accessToken: string, body = brokerDealerBody, config?: AxiosAuthRequestConfig): Promise<DashboardResponseData[]> =>
  fetchDashboardStatsSSR(accessToken, body, 'fetchAgentsSSR', config).then((data) => data.data.sort((a, b) => sortAlphabetically(a.name, b.name)));

export const completedCasesByProcessSubtypeBody = {
  filter: {
    createdDateStart: oneYearAgoISO,
    caseStatus: ['COMPLETED'],
    process: ['New Business'],
  },
  groupBy: ['processSubType', 'exceptionCategory'],
}

export const fetchCompletedCasesByProcessSubTypeSSR = async (accessToken: string, config?: AxiosAuthRequestConfig): Promise<DashboardResponseData[]> =>
  fetchDashboardStatsSSR(accessToken, completedCasesByProcessSubtypeBody, 'fetchCompletedCasesByProcessSubTypeSSR', config).then((data) => data.data);

export const fetchCompletedCasesByProcessSubType = async (body = completedCasesByProcessSubtypeBody, config?: AxiosAuthRequestConfig): Promise<DashboardResponseData[]> =>
  fetchDashboardStats(body, 'fetchCompletedCasesByProcessSubType', config).then((data) => data.data);

export const top5ProductsBody = {
  filter: {
    createdDateStart: oneYearAgoISO,
    process: ['New Business'],
    caseStatus: ['COMPLETED'],
  },
  groupBy: ['processSubType', 'productName', 'updatedAt'],
}

export const fetchTop5ProductsSSR = async (accessToken: string, config?: AxiosAuthRequestConfig): Promise<DashboardResponseData[]> =>
  fetchDashboardStatsSSR(accessToken, top5ProductsBody, 'fetchTop5ProductsSSR', config).then((data) => data.data);

export const fetchTop5Products = async (body = top5ProductsBody, config?: AxiosAuthRequestConfig): Promise<DashboardResponseData[]> =>
  fetchDashboardStats(body, 'fetchTop5Products', config).then((data) => data.data);