import { cookies } from 'next/headers';

import { isProd } from '@/utils';

export const apiVersion = 'v1';
export const AUDIENCE = process.env.NEXT_PUBLIC_BACKEND_URL;
export const baseAppUrl = process.env.NEXT_PUBLIC_BASE_URL;
export const apiServerBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
export const apiServerUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${apiVersion}`;
export const policyApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/policy/${apiVersion}/policies`;
export const carrierApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${apiVersion}/carriers`;
export const integrationApiBaseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/integration/${apiVersion}`;
export const isMockAllRequestEnabled = (val?: boolean) => {
  if (isProd()) {
    return false;
  }

  if (val !== undefined) {
    return val;
  }

  const cookieStore = cookies();
  const mockParam = cookieStore.get('..mock..');
  return (
    mockParam?.value === 'on' ||
    process.env.NEXT_PUBLIC_MOCK_API_REQUEST === 'true'
  );
};

export const isMockSearchRequestEnabled = () => {
  if (isProd()) {
    return false;
  }

  const cookieStore = cookies();
  const mockParam = cookieStore.get('..mock..');
  return mockParam?.value.includes('search') || isMockAllRequestEnabled();
};

export const isMockPolicyOverviewRequestEnabled = () => {

  if (isProd()) {
    return false;
  }
  
  const cookieStore = cookies();
  const mockParam = cookieStore.get('..mock..');
  return (
    mockParam?.value.includes('policyOverview') || isMockAllRequestEnabled()
  );
};
