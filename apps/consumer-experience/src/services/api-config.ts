import { cookies } from 'next/headers';

import { isProd } from '@/utils';

export const apiVersion = 'v1';
export const AUDIENCE = process.env.NEXT_PUBLIC_BACKEND_URL;
export const baseAppUrl = process.env.NEXT_PUBLIC_BASE_URL;
export const apiServerBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
export const apiServerUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${apiVersion}`;
export const policyApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/policy/${apiVersion}/policies`;
export const documentApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/document/v2/documents`;
export const carrierApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${apiVersion}/carriers`;
export const integrationApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/integration/${apiVersion}`;

enum PolicyEndpoints {
  METRICS = 'metrics',
  TRANSACTIONS = 'transactions',
  POLICY = 'policy',
  POLICY_BY_CARRIERS = 'policy_by_carriers',
}

const getMockParam = () => {
  const cookieStore = cookies();
  return cookieStore.get('..mock..')?.value;
};

const getMockErrorParam = () => {
  const cookieStore = cookies();
  return cookieStore.get('..mock_error..')?.value;
};

export const isMockPolicyErrorEnabled = () => {
  if (isProd()) {
    return false;
  }

  const mockErrorVals = getMockErrorParam();

  if (!mockErrorVals) {
    return false;
  }

  return JSON.parse(mockErrorVals).includes(PolicyEndpoints.POLICY);
};

export const isMockTransactionsErrorEnabled = () => {
  if (isProd()) {
    return false;
  }

  const mockErrorVals = getMockErrorParam();

  if (!mockErrorVals) {
    return false;
  }

  return JSON.parse(mockErrorVals).includes(PolicyEndpoints.TRANSACTIONS);
};

export const isMockMetricsErrorEnabled = () => {
  if (isProd()) {
    return false;
  }

  const mockErrorVals = getMockErrorParam();

  if (!mockErrorVals) {
    return false;
  }

  return JSON.parse(mockErrorVals).includes(PolicyEndpoints.METRICS);
};

export const isMockPolicyCarriersErrorEnabled = () => {
  if (isProd()) {
    return false;
  }

  const mockErrorVals = getMockErrorParam();

  if (!mockErrorVals) {
    return false;
  }

  return JSON.parse(mockErrorVals).includes(PolicyEndpoints.POLICY_BY_CARRIERS);
};

export const isMockAllRequestEnabled = (val?: boolean) => {
  if (isProd()) {
    return false;
  }

  if (val !== undefined) {
    return val;
  }

  return (
    getMockParam() === 'on' ||
    process.env.NEXT_PUBLIC_MOCK_API_REQUEST === 'true'
  );
};

export const isMockSearchRequestEnabled = () => {
  if (isProd()) {
    return false;
  }

  return getMockParam()?.includes('search') || isMockAllRequestEnabled();
};

export const isMockPolicyOverviewRequestEnabled = () => {
  if (isProd()) {
    return false;
  }

  return (
    getMockParam()?.includes('policyOverview') || isMockAllRequestEnabled()
  );
};

export const isMockPaymentHistoryRequestEnabled = () => {
  if (isProd()) {
    return false;
  }

  return (
    getMockParam()?.includes('paymentHistory') || isMockAllRequestEnabled()
  );
};
export const isMockPolicyMetricsRequestEnabled = () => {
  if (isProd()) {
    return false;
  }

  return getMockParam()?.includes('policyMetrics') || isMockAllRequestEnabled();
};

export const isMockDocumentRequestEnabled = () => {
  if (isProd()) {
    return false;
  }

  return getMockParam()?.includes('documents') || isMockAllRequestEnabled();
};

export const isMockRidersRequestEnabled = () => {
  if (isProd()) {
    return false;
  }

  return getMockParam()?.includes('riders') || isMockAllRequestEnabled();
};
