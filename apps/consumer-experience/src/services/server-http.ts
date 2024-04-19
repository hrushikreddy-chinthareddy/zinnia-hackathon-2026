import { getAccessToken } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';

import { MOCK_ERROR_COOKIE_KEY } from '@/utils/serverClientUtils';

import { HttpRequest } from './http';

class ServerHttpRequest extends HttpRequest {
  request = async (
    input: string | URL | Request,
    init?: RequestInit | undefined
  ): Promise<Response> => {
    const { accessToken } = await getAccessToken();

    const requestInit: RequestInit = init || {};
    if (!requestInit.headers) {
      requestInit.headers = {};
    }

    requestInit.headers = {
      ...requestInit.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    const cookieStore = cookies();

    if (cookieStore.get(MOCK_ERROR_COOKIE_KEY)?.value === 'on') {
      throw new Error('Mocking Error Service Enabled.');
    }

    return fetch(input, requestInit);
  };
}

export const ServerApi = new ServerHttpRequest();
