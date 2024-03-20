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

    return fetch(input, requestInit);
  };
}

export const ClientApi = new ClientHttpRequest();
