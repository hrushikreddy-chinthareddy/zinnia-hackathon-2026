import { handleUnauthorizedResponse } from '@/utils/logout';

import { HttpRequest } from './http';

class ClientHttpRequest extends HttpRequest {
  request = async (
    input: string | URL | Request,
    init?: RequestInit | undefined
  ): Promise<Response> => {
    const requestInit: RequestInit = init || {};

    if (!requestInit.headers) {
      requestInit.headers = {} as HeadersInit;
    }

    requestInit.headers = {
      ...requestInit.headers,
      credentials: 'include',
    };

    const response = await fetch(input, requestInit);

    // Handle 401 Unauthorized responses by logging out immediately
    handleUnauthorizedResponse(response);

    return response;
  };
}

export const ClientApi = new ClientHttpRequest();
