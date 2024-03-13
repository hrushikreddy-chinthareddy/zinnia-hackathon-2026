import { getAccessToken } from '@auth0/nextjs-auth0';

class HttpRequest {
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

    return fetch(input, requestInit);
  };

  get = (input: string | URL | Request, init?: RequestInit | undefined) => {
    init = init || {};
    init.method = 'GET';
    return this.request(input, init);
  };

  post = (
    input: string | URL | Request,
    data?: BodyInit | null | undefined,
    init?: RequestInit | undefined
  ) => {
    init = init || {};
    init.method = 'POST';
    init.body = data;
    return this.request(input, init);
  };
}

export const ServerApi = new HttpRequest();
