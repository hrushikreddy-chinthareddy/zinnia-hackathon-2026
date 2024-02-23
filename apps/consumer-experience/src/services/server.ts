import { getAccessToken } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

import applyMockAdapter from '@/utils/mocks';

import { axios } from './http';

const serverApi = axios.create();

serverApi.interceptors.request.use(async config => {
  const cookieStore = cookies();
  config.headers.cookie = cookieStore.toString();
  const { accessToken } = await getAccessToken();

  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

if (process.env.NEXT_PUBLIC_MOCK_API_REQUEST === 'true') {
  applyMockAdapter(serverApi);
}

export { serverApi };
